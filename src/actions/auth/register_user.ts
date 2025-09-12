import type { PartialUser } from "@models/user";
import { insertUser, type DataType } from "@queries";
import { generateToken, hash } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { DrizzleQueryError } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";

export const registerUser = defineAction({
    input: z.object({
        body: z.object({
            username: z
                .string({
                    invalid_type_error: "username must be a string",
                    required_error: "username is required"
                })
                .nonempty("username cannot be empty"),
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
                .min(8, "password must be at least 8 characters long")
                .max(64, "password cannot be longer than 64 characters")
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/,
                    "password must contain at least one uppercase letter, one lowercase letter, and one number"
                )
        }),
        fields: z
            .string({
                invalid_type_error: "fields must be a string"
            })
            .or(
                z.array(z.string(), {
                    invalid_type_error: "fields must be an array of strings"
                })
            )
            .optional()
            .transform((e) => (typeof e === "string" ? [e] : e))
    }),
    handler: async (input, ctx): Promise<PartialUser> => {
        const { body, fields } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const resend = new Resend(ctx.locals.runtime.env.EMAIL_TOKEN);

        // Register the user
        const data: DataType = await insertUser(
            db,
            {
                username: body.username,
                email: body.email,
                password: await hash(body.password)
            },
            { fields }
        ).catch((e) => {
            const msg = (e as DrizzleQueryError).cause?.message;

            if (msg?.includes("UNIQUE") && msg?.includes("users.email")) {
                throw new ActionError({
                    code: "CONFLICT",
                    message: "A user with this email already exists"
                });
            }
            throw e;
        });

        // Send verification email
        if (data) {
            // Generate verification token
            const token = await generateToken(
                { id: data.id },
                ctx.locals.runtime.env.VERIFY_EMAIL_SECRET,
                60 * 30 // 30 mins
            );

            await resend.emails.send({
                from: "Mi Roulotte <no-reply@miroulotte.es>",
                to: [data.email],
                subject: "Verifica tu correo electrónico",
                html: `<div style="max-width:600px;margin:0 auto;background-color:#fff;padding:1.75rem;font-family:Helvetica,Arial,'Segoe UI',Roboto,sans-serif;font-size:1rem;line-height:1.5;color:#525252"><h1 style="font-size:1.25rem;line-height:1.4;color:#161616;margin-bottom:1.25rem">Verifica tu correo electrónico</h1><p style="margin:0 0 1rem">Hola ${data.username},</p><p style="margin:0 0 1rem">Gracias por registrarte en <strong>Mi Roulotte</strong>. Antes de comenzar, necesitamos confirmar que esta dirección de correo electrónico te pertenece.</p><p style="margin:0 0 1rem">Por favor, haz clic en el siguiente botón para verificar tu cuenta:</p><a href="${ctx.locals.runtime.env.SITE ?? import.meta.env.SITE}/verificar-email?token=${token}" rel="noopener noreferrer" style="display:inline-block;margin:0 0 .75rem;padding:1rem 1.5rem;background-color:#161616;color:#fff;text-decoration:none;text-align:center;align-content:center">Verificar correo</a><p style="font-size:.75rem;color:#a8a8a8;line-height:1.333;margin:2rem 0 0 0">Este correo se ha enviado automáticamente desde <a href="${ctx.locals.runtime.env.SITE ?? import.meta.env.SITE}" rel="noopener noreferrer" style="color:currentColor;text-decoration:underline">Mi Roulotte</a>. Si no creaste esta cuenta, puedes ignorar este mensaje.</p></div>`
            });
        }

        return {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            isActive: data.isActive,
            emailVerified: data.emailVerified,
            twoFactorAuthentication: data.twoFactorAuthentication,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
});
