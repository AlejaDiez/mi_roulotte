import {
    CommentsTable,
    CommentsTableColumns,
    StagesTable,
    StagesTableColumns,
    TripsTable,
    TripsTableColumns
} from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import {
    validateEmail,
    validateOptionalString,
    validateString
} from "@utils/validators";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import type { PartialCommentPreview } from "./get_comments";

const resend = new Resend(import.meta.env.EMAIL_TOKEN);

export const replyComment = defineAction({
    input: z.object({
        id: z.number(),
        body: z.record(z.any()),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id, body, relative_url, fields },
        context
    ): Promise<PartialCommentPreview> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const errors = [];

        // Validate body
        if (!validateString(body["username"])) {
            errors.push("'username' is missing or invalid");
        }
        if (
            !validateOptionalString(body["email"]) ||
            (validateString(body["email"]) && !validateEmail(body["email"]))
        ) {
            errors.push("'email' is invalid");
        }
        if (!validateString(body["content"])) {
            errors.push("'content' is missing or invalid");
        }
        if (errors.length > 0) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: `Validation failed: ${errors.join("; ")}`
            });
        }

        // Check if is possible to reply a comment
        const comment = await db
            .select({
                tripId: CommentsTableColumns.tripId,
                stageId: CommentsTableColumns.stageId,
                username: CommentsTableColumns.username,
                email: CommentsTableColumns.email,
                content: CommentsTableColumns.content
            })
            .from(CommentsTable)
            .where(eq(CommentsTable.id, id))
            .get();

        if (!comment) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${id}' does not exist`
            });
        }

        const sectionData = comment.stageId
            ? await db
                  .select({
                      title: StagesTableColumns.title,
                      allowComments: StagesTableColumns.allowComments
                  })
                  .from(StagesTable)
                  .where(
                      and(
                          eq(StagesTable.id, comment.stageId),
                          eq(StagesTable.tripId, comment.tripId)
                      )
                  )
                  .get()
            : await db
                  .select({
                      title: TripsTableColumns.title,
                      allowComments: TripsTableColumns.allowComments
                  })
                  .from(TripsTable)
                  .where(eq(TripsTable.id, comment.tripId))
                  .get();

        if (!sectionData) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: comment.stageId
                    ? `Stage with id '${comment.stageId}' and trip id '${comment.tripId}' does not exist`
                    : `Trip with id '${comment.tripId}' does not exist`
            });
        } else if (!sectionData.allowComments) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: comment.stageId
                    ? `Stage does not allow comments`
                    : `Trip does not allow comments`
            });
        }

        // Get data
        const data = await db
            .insert(CommentsTable)
            .values({
                tripId: comment.tripId,
                stageId: comment.stageId,
                username: body["username"],
                email: body["email"],
                content: body["content"],
                repliedTo: id
            })
            .returning()
            .get();

        // Send email
        if (comment.email) {
            await resend.emails.send({
                from: "Mi Roulotte <no-reply@miroulotte.es>",
                to: [comment.email],
                subject: `Han respondido a tu comentario en "${sectionData.title}"`,
                html: `<div style=background-color:#f4f4f4;margin:0;padding:1.75rem;font-family:Helvetica,Arial,sans-serif;font-size:1rem;line-height:1.5;color:#525252><div style="max-width:600px;margin:0 auto;background-color:#fff;padding:1.75rem"><h1 style=font-size:1.25rem;line-height:1.4;color:#161616;margin-bottom:1.25rem>¡Tienes una nueva respuesta!</h1><p style="margin:0 0 1rem">Hola ${comment.username},<p style="margin:0 0 1rem">Han respondido a tu comentario en ${comment.stageId ? "la etapa" : "el viaje"} <strong>“${sectionData.title}”</strong>.<p style="margin:0 0 .5rem"><strong>Tu comentario:</strong><blockquote style="margin:0 0 1rem;padding:1rem;background:#f4f4f4;border-left:2px solid #a8a8a8;color:#525252;font-style:italic">${comment.content}</blockquote><p style="margin:0 0 .5rem"><strong>Respuesta:</strong><blockquote style="margin:0 0 1rem;padding:1rem;background:#f4f4f4;border-left:2px solid #a8a8a8;color:#525252;font-style:italic">${data.content}</blockquote><p style="margin:0 0 1rem">Puedes ver la conversación completa aquí:</p><a href="${composeUrl(data.tripId, data.stageId, `#comment-${data.id}`)}"style="display:inline-block;align-content:center;margin:0 0 .75rem;padding:1rem 1.5rem;background-color:#161616;color:#fff;text-decoration:none;text-align:center">Ver respuesta</a><p style="font-size:.75rem;color:#a8a8a8;line-height:1.333;margin:2rem 0 0 0">Este correo se ha enviado automáticamente desde <a href=${composeUrl()} style=color:currentColor;text-decoration:underline>Mi Roulotte </a>. Si no deseas recibir más notificaciones, puedes <a href=""style=color:currentColor;text-decoration:underline>cambiarlas aquí</a>.</div></div>`
            });
        }

        return filterObject(
            {
                id: data.id,
                username: data.username,
                content: data.content,
                url: relative_url
                    ? composeRelativeUrl(
                          data.tripId,
                          data.stageId,
                          `#comment-${data.id}`
                      )
                    : composeUrl(
                          data.tripId,
                          data.stageId,
                          `#comment-${data.id}`
                      ),
                lastModifiedAt: data.modifiedAt ?? data.createdAt,
                replies: []
            },
            { fields }
        );
    }
});
