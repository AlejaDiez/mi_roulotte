import { updateComment } from "@queries";
import { validateToken } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const unsubscribeRepliesNotifications = defineAction({
    input: z.object({
        commentId: z
            .number({
                invalid_type_error: "commentId must be a number",
                required_error: "commentId is required"
            })
            .int("commentId must be an integer number")
            .positive("commentId must be a positive number"),
        token: z
            .string({
                invalid_type_error: "token must be a string",
                required_error: "token is required"
            })
            .nonempty("token must not be empty")
    }),
    handler: async (input, ctx): Promise<void> => {
        const { commentId, token } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Validate token
        const data = validateToken(token, import.meta.env.UNSUBSCRIBE_SECRET);

        if (!data) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message: "Invalid or expired token"
            });
        }

        if (data.id !== commentId) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: "Invalid comment id for this token"
            });
        }

        // Update comment email
        const updated = await updateComment(db, data.id, { email: null });

        if (!updated) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${data.id}' was not found or may have been deleted`
            });
        }
    }
});
