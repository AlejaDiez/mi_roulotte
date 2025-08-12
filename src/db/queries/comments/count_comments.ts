import { CommentsTable, StagesTable } from "@schemas";
import { and, count, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const countComments = (
    db: DrizzleD1Database,
    tripId?: string,
    stageId?: string | null
) => {
    const query = db
        .select({
            count: count()
        })
        .from(StagesTable);

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
    return query.get();
};
