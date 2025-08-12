import { type DataType, deleteComment as deleteCommentQuery } from "@queries";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const deleteComment = defineAction({
    input: z.object({
        commentId: z
            .number({
                invalid_type_error: "commentId must be a number",
                required_error: "commentId is required"
            })
            .int("commentId must be an integer number")
            .positive("commentId must be a positive number")
    }),
    handler: async (input, ctx): Promise<void> => {
        const { commentId } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data: DataType = await deleteCommentQuery(db, commentId);

        if (data.length === 0) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${commentId}' not found`
            });
        }
    }
});
