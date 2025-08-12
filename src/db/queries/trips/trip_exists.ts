import { TripsTable } from "@schemas";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const tripExists = (db: DrizzleD1Database, tripId: string) => {
    return db
        .select({
            _: sql`1`
        })
        .from(TripsTable)
        .where(eq(TripsTable.id, tripId))
        .get();
};
