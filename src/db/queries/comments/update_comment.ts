import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const updateComment = (
    db: DrizzleD1Database,
    commentId: string,
    value: {
        username?: string;
        email?: string | null;
        content?: string;
    },
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
