import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectComment = (
    db: DrizzleD1Database,
    commentId: string,
    config?: {
        fields?: string[];
        site?: string;
    }
) => {
    const columns = {
        id: CommentsTable.id,
        tripId: CommentsTable.tripId,
        stageId: CommentsTable.stageId,
        username: CommentsTable.username,
        email: CommentsTable.email,
        content: CommentsTable.content,
        url: sql`
            CASE 
                WHEN ${CommentsTable.stageId} IS NULL THEN 
                    CONCAT(${config?.site ?? ""}, '/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                ELSE 
                    CONCAT(${config?.site ?? ""}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
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
