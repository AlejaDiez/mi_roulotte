import type { PartialComment } from "@models/comment";
import {
    insertComment,
    selectComment,
    selectStage,
    selectTrip,
    type DataType
} from "@queries";
import { generateToken } from "@utils/crypto";
import { fields } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.EMAIL_TOKEN);

export const replyComment = defineAction({
    input: z.object({
        commentId: z
            .string({
                invalid_type_error: "commentId must be a string",
                required_error: "commentId is required"
            })
            .nonempty("commentId cannot be empty"),
        body: z.object({
            username: z
                .string({
                    invalid_type_error: "username must be a string",
                    required_error: "username is required"
                })
                .nonempty("username must not be empty"),
            email: z
                .string({
                    invalid_type_error: "email must be a string or undefined"
                })
                .email("email must be a valid email address")
                .nullable()
                .optional(),
            content: z
                .string({
                    invalid_type_error: "content must be a string",
                    required_error: "content is required"
                })
                .nonempty("content must not be empty")
        }),
        fields,
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialComment> => {
        const { commentId, body, fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Check if exists parent comment
        const comment = (await selectComment(db, commentId, {
            fields: [
                "id",
                "tripId",
                "stageId",
                "username",
                "email",
                "content",
                "url"
            ]
        })) as any;

        if (!comment) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${comment.id}' does not exist`
            });
        }

        // Check if is possible to add a comment
        const { title, allowComments } = ((await (comment.stageId
            ? selectStage(db, comment.tripId, comment.stageId, {
                  fields: ["name", "title", "allowComments"]
              })
            : selectTrip(db, comment.tripId, {
                  fields: ["name", "title", "allowComments"]
              }))) ?? {}) as any;

        if (allowComments === undefined) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: comment.stageId
                    ? `Stage with id '${comment.stageId}' and trip id '${comment.tripId}' does not exist`
                    : `Trip with id '${comment.tripId}' does not exist`
            });
        } else if (!allowComments) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: comment.stageId
                    ? `Stage does not allow comments`
                    : `Trip does not allow comments`
            });
        }

        // Insert the comment
        const data: DataType = await insertComment(
            db,
            {
                tripId: comment.tripId,
                stageId: comment.stageId,
                username: body.username,
                email: body.email,
                content: body.content,
                repliedTo: commentId,
                userAgent: ctx.request.headers.get("user-agent"),
                ipAddress: ctx.clientAddress
            },
            {
                fields,
                relative
            }
        );

        // Send email
        if (data && comment.email) {
            // Generate unsubscribe token
            const token = await generateToken(
                { id: comment.id },
                import.meta.env.UNSUBSCRIBE_SECRET,
                60 * 60 * 24 * 7 // 7 days
            );

            await resend.emails.send({
                from: "Mi Roulotte <no-reply@miroulotte.es>",
                to: [comment.email],
                subject: `Nueva respuesta en "${title}"`,
                html: `<div style="max-width:600px;margin:0 auto;background-color:#fff;padding:1.75rem;font-family:Helvetica,Arial,'Segoe UI',Roboto,sans-serif;font-size:1rem;line-height:1.5;color:#525252"><h1 style="font-size:1.25rem;line-height:1.4;color:#161616;margin-bottom:1.25rem">¡Tienes una nueva respuesta!</h1><p style="margin:0 0 1rem">Hola ${comment.username},</p><p style="margin:0 0 1rem">Han respondido a tu comentario en el post <strong>"${title}"</strong>.</p><p style="margin:0 0 .5rem"><strong>Tu comentario:</strong></p><blockquote style="margin:0 0 1rem;padding:1rem;background:#f4f4f4;border-left:1px solid #a8a8a8;color:#525252;font-style:italic">${comment.content}</blockquote><p style="margin:0 0 .5rem"><strong>Respuesta:</strong></p><blockquote style="margin:0 0 1rem;padding:1rem;background:#f4f4f4;border-left:1px solid #a8a8a8;color:#525252;font-style:italic">${data.content}</blockquote><p style="margin:0 0 1rem">Puedes ver la conversación completa aquí:</p><a href="${comment.url}" rel="noopener noreferrer" style="display:inline-block;margin:0 0 .75rem;padding:1rem 1.5rem;background-color:#161616;color:#fff;text-decoration:none;text-align:center;align-content:center">Ver respuesta</a><p style="font-size:.75rem;color:#a8a8a8;line-height:1.333;margin:2rem 0 0 0">Este correo se ha enviado automáticamente desde <a href="${import.meta.env.SITE}" rel="noopener noreferrer" style="color:currentColor;text-decoration:underline">Mi Roulotte</a>. Si no deseas recibir más notificaciones de comentarios, puedes <a href="${import.meta.env.SITE}/baja-notificaciones?token=${token}" rel="noopener noreferrer" style="color:currentColor;text-decoration:underline">gestionarlas aquí</a>.</p></div>`
            });
        }

        return {
            id: data.id,
            tripId: data.tripId,
            stageId: data.stageId,
            username: data.username,
            content: data.content,
            repliedTo: data.repliedTo,
            replies:
                !fields || fields?.length === 0 || fields?.includes("replies")
                    ? []
                    : undefined,
            url: data.url,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
});
