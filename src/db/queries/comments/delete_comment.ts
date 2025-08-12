import { CommentsTable } from "@schemas";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const deleteComment = (db: DrizzleD1Database, commentId: number) => {
    return db
        .delete(CommentsTable)
        .where(eq(CommentsTable.id, commentId))
        .returning({ id: CommentsTable.id });
};
