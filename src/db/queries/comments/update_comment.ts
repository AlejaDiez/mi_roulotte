import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const updateComment = (
    db: DrizzleD1Database,
    commentId: number,
    value: {
        username?: string;
        email?: string | null;
        content?: string;
    },
    config?: {
        fields?: string[];
        relative?: boolean;
    }
) => {
    const columns = {
        id: CommentsTable.id,
        tripId: CommentsTable.tripId,
        stageId: CommentsTable.stageId,
        username: CommentsTable.username,
        email: CommentsTable.email,
        content: CommentsTable.content,
        url: config?.relative
            ? sql`
                    CASE 
                        WHEN ${CommentsTable.stageId} IS NULL THEN 
                            CONCAT('/', ${CommentsTable.tripId}, '/#comment-', ${CommentsTable.id})
                        ELSE 
                            CONCAT('/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#comment-', ${CommentsTable.id})
                    END`
            : sql`
                    CASE 
                        WHEN ${CommentsTable.stageId} IS NULL THEN 
                            CONCAT(${import.meta.env.SITE}, '/', ${CommentsTable.tripId}, '/#comment-', ${CommentsTable.id})
                        ELSE 
                            CONCAT(${import.meta.env.SITE}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#comment-', ${CommentsTable.id})
                    END`,
        repliedTo: CommentsTable.repliedTo,
        createdAt: CommentsTable.createdAt,
        modifiedAt: CommentsTable.modifiedAt
    };
    const query = db
        .update(CommentsTable)
        .set({
            username: value.username,
            email: value.email,
            content: value.content
        })
        .where(eq(CommentsTable.id, commentId))
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
