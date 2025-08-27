import type { UserCredentials } from "@models/user";
import {
    deleteOTP,
    insertOTP,
    insertSession,
    selectUserByEmail,
    tryDeleteOTP,
    type DataType
} from "@queries";
import { compareHash, generateHash, generateToken } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.EMAIL_TOKEN);

export const loginUser = defineAction({
    input: z.object({
        email: z
            .string({
                invalid_type_error: "email must be a string",
                required_error: "email is required"
            })
            .email("email must be a valid email address"),
        password: z
            .string({
                invalid_type_error: "password must be a string",
                required_error: "password is required"
            })
            .nonempty("password cannot be empty"),
        otp: z
            .string({
                invalid_type_error: "otp must be a string"
            })
            .length(6, "otp must be 6 characters long")
            .optional()
    }),
    handler: async (input, ctx): Promise<UserCredentials> => {
        const { email, password, otp } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Register the user
        const data: DataType = await selectUserByEmail(db, email, {
            fields: [
                "id",
                "username",
                "email",
                "password",
                "role",
                "isActive",
                "emailVerified",
                "twoFactorAuthentication"
            ]
        });

        // Check that user exists and password is correct
        if (!data || !(await compareHash(password, data.password))) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message: "Invalid email or password"
            });
        }
        // Check that user is active
        if (!data.isActive) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: "Your account has been disabled"
            });
        }
        // Check that email is verified
        if (!data.emailVerified) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: "Email not verified"
            });
        }
        // Check for 2FA
        if (data.twoFactorAuthentication) {
            if (!otp) {
                await deleteOTP(db, data.id);
                const otpData: DataType = await insertOTP(
                    db,
                    {
                        userId: data.id,
                        expiresIn: 60 * 7 // 7 min
                    },
                    {
                        fields: ["code"]
                    }
                );

                if (otpData) {
                    await resend.emails.send({
                        from: "Mi Roulotte <no-reply@miroulotte.es>",
                        to: [data.email],
                        subject: "Tu código de verificación",
                        html: `<div style="max-width:600px;margin:0 auto;background-color:#fff;padding:1.75rem;font-family:Helvetica,Arial,'Segoe UI',Roboto,sans-serif;font-size:1rem;line-height:1.5;color:#525252"><h1 style="font-size:1.25rem;line-height:1.4;color:#161616;margin-bottom:1.25rem">Tu código de verificación</h1><p style="margin:0 0 1rem">Hola ${data.username},</p><p style="margin:0 0 1rem">Has solicitado un código de verificación para acceder a tu cuenta en <strong>Mi Roulotte</strong>.</p><p style="margin:0 0 1.5rem">Introduce este código en la aplicación para completar el inicio de sesión:</p><div style="display:flex;flex-direction:row;width:100%;gap:.5rem;align-items:center;justify-content:center;margin:0 0 1.5rem;font-size:1.25rem;font-weight:500;font-family:serif"><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[0]}</div><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[1]}</div><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[2]}</div><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[3]}</div><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[4]}</div><div style="display:inline-block;align-content:center;padding:0 1rem;height:3.5rem;background-color:#f4f4f4">${otpData.code[5]}</div></div><p style="margin:0 0 1rem">Este código caduca en <strong>7 minutos</strong>. Si no has solicitado este código, puedes ignorar este mensaje.</p><p style="font-size:.75rem;color:#a8a8a8;line-height:1.333;margin:2rem 0 0 0">Este correo se ha enviado automáticamente desde <a href="${import.meta.env.SITE}" rel="noopener noreferrer" style="color:currentColor;text-decoration:underline">Mi Roulotte</a>. Por tu seguridad, nunca compartas este código con nadie.</p></div>`
                    });
                }
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "OTP code is required"
                });
            } else {
                const otpData = await tryDeleteOTP(db, data.id, otp);

                if (!otpData) {
                    throw new ActionError({
                        code: "FORBIDDEN",
                        message: "OTP code is not valid, please try again"
                    });
                }
            }
        }

        // Create session
        const sessionData: DataType = await insertSession(
            db,
            {
                userId: data.id,
                refresh: generateHash(),
                expiresIn: 60 * 60 * 24 * 30, // 30 days,
                userAgent: ctx.request.headers.get("user-agent"),
                ipAddress:
                    ctx.request.headers.get("CF-Connecting-IP") ??
                    ctx.request.headers.get("x-forwarded-for")
            },
            { fields: ["id", "uid", "refresh"] }
        );

        // Create token
        const token = generateToken(
            {
                id: data.id,
                username: data.username,
                role: data.role
            },
            import.meta.env.AUTH_SECRET,
            60 * 15 // 15 min
        );

        // Create refresh token
        const refreshToken = generateToken(
            {
                id: sessionData.id,
                uid: sessionData.uid,
                refresh: sessionData.refresh
            },
            import.meta.env.REFRESH_AUTH_SECRET,
            60 * 60 * 24 * 30 // 30 days
        );

        return {
            token,
            refreshToken
        };
    }
});
