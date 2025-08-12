import { TripsTable } from "@schemas";
import { count } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const countTrips = (db: DrizzleD1Database) => {
    return db
        .select({
            count: count()
        })
        .from(TripsTable)
        .get();
};
