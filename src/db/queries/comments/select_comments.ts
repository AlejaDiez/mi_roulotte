import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectComments = (
    db: DrizzleD1Database,
    tripId?: string,
    stageId?: string | null,
    config?: {
        fields?: string[];
        relative?: boolean;
    }
) => {
    const columns = {
        _id: CommentsTable.id,
        _repliedTo: CommentsTable.repliedTo,
        id: CommentsTable.id,
        username: CommentsTable.username,
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
        lastUpdatedAt:
            sql`COALESCE(${CommentsTable.updatedAt}, ${CommentsTable.createdAt})`.mapWith(
                CommentsTable.updatedAt
            )
    };
    const query = db
        .select(filterObjectColumns(columns, config?.fields))
        .from(CommentsTable)
        .orderBy(
            desc(
                sql`COALESCE(${CommentsTable.updatedAt}, ${CommentsTable.createdAt})`
            )
        );

    // Conditions
    if (tripId && stageId) {
        query.where(
            and(
                eq(CommentsTable.tripId, tripId),
                eq(CommentsTable.stageId, stageId)
            )
        );
    } else if (tripId && stageId === null) {
        query.where(
            and(eq(CommentsTable.tripId, tripId), isNull(CommentsTable.stageId))
        );
    } else if (tripId) {
        query.where(eq(CommentsTable.tripId, tripId));
    } else if (stageId) {
        query.where(eq(CommentsTable.stageId, stageId));
    } else if (stageId === null) {
        query.where(isNull(CommentsTable.stageId));
    }
    return query;
};
