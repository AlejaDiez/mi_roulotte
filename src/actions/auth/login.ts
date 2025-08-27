import type { UserCredentials } from "@models/user";
import { insertSession, selectUserByEmail, type DataType } from "@queries";
import { compareHash, generateHash, generateToken } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

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
                // TODO: Send OTP
                throw new ActionError({
                    code: "FORBIDDEN",
                    message: "OTP is required"
                });
            } else {
                // TODO: Verify OTP
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
