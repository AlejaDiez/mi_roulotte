import { CommentsTable } from "@schemas";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export const deleteComment = defineAction({
    input: z.object({
        id: z.number()
    }),
    handler: async ({ id }, context): Promise<void> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .delete(CommentsTable)
            .where(eq(CommentsTable.id, id))
            .returning();

        if (data.length === 0) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${id}' not found`
            });
        }
    }
});
