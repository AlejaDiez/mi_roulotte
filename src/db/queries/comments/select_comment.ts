import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectComment = (
    db: DrizzleD1Database,
    commentId: string,
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
                        CONCAT('/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                    ELSE 
                        CONCAT('/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
                END`
            : sql`
                CASE 
                    WHEN ${CommentsTable.stageId} IS NULL THEN 
                        CONCAT(${import.meta.env.SITE}, '/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                    ELSE 
                        CONCAT(${import.meta.env.SITE}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
                END`,
        repliedTo: CommentsTable.repliedTo,
        userAgent: CommentsTable.userAgent,
        ipAddress: CommentsTable.ipAddress,
        createdAt: CommentsTable.createdAt,
        updatedAt: CommentsTable.updatedAt
    };
    const query = db
        .select(filterObjectColumns(columns, config?.fields))
        .from(CommentsTable)
        .where(eq(CommentsTable.id, commentId))
        .get();

    return query;
};
