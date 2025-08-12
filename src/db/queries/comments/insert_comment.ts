import { CommentsTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const insertComment = (
    db: DrizzleD1Database,
    value: {
        tripId: string;
        stageId?: string | null;
        username: string;
        email?: string | null;
        content: string;
        repliedTo?: number | null;
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
        .insert(CommentsTable)
        .values({
            tripId: value.tripId,
            stageId: value.stageId,
            username: value.username,
            email: value.email,
            content: value.content,
            repliedTo: value.repliedTo
        })
        .returning(filterObject(columns, config?.fields))
        .get();

    return query;
};
