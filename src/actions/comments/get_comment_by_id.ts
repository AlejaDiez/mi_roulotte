import type { PartialComment } from "@models/comment";
import {
    selectComment,
    selectCommentReplies,
    type DataType,
    type ListDataType
} from "@queries";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getCommentById = defineAction({
    input: z.object({
        commentId: z
            .string({
                invalid_type_error: "commentId must be a string",
                required_error: "commentId is required"
            })
            .nonempty("commentId cannot be empty"),
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
            .transform((e) => (typeof e === "string" ? [e] : e)),
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialComment> => {
        const { commentId, fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data: DataType = await selectComment(db, commentId, {
            fields,
            site: !relative
                ? (ctx.locals.runtime.env.SITE ?? import.meta.env.SITE)
                : undefined
        });

        // Comment exists???
        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${commentId}' not found`
            });
        }

        // Get replies
        let repliesData: ListDataType | undefined;

        if (!fields || fields?.length === 0 || fields?.includes("replies")) {
            repliesData = await selectCommentReplies(db, commentId, {
                fields,
                site: !relative
                    ? (ctx.locals.runtime.env.SITE ?? import.meta.env.SITE)
                    : undefined
            });
        }

        return {
            id: data.id,
            tripId: data.tripId,
            stageId: data.stageId,
            username: data.username,
            content: data.content,
            repliedTo: data.repliedTo,
            replies: repliesData,
            url: data.url,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
});
