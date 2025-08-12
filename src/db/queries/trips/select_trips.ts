import { TripsTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectTrips = (
    db: DrizzleD1Database,
    config?: {
        fields?: string[];
        page?: number;
        limit?: number;
        relative?: boolean;
    }
) => {
    const columns = {
        name: TripsTable.name,
        date: TripsTable.date,
        title: TripsTable.title,
        description: TripsTable.description,
        image: TripsTable.image,
        video: TripsTable.video,
        url: config?.relative
            ? sql`CONCAT('/', ${TripsTable.id})`
            : sql`CONCAT(${import.meta.env.SITE}, '/', ${TripsTable.id})`
    };
    const query = db
        .select(filterObject(columns, config?.fields))
        .from(TripsTable)
        .where(eq(TripsTable.published, true));

    if (config?.page) {
        query.offset((config.page - 1) * (config.limit ?? 0));
    }
    if (config?.limit) {
        query.limit(config?.limit);
    }
    query.orderBy(TripsTable.date);
    return query;
};
