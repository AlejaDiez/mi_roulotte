import { StagesTable } from "@schemas";
import { count, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const countStages = (db: DrizzleD1Database, tripId: string) => {
    return db
        .select({
            count: count()
        })
        .from(StagesTable)
        .where(eq(StagesTable.tripId, tripId))
        .get();
};
