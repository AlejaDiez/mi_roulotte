import { StagesTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectStages = (
    db: DrizzleD1Database,
    tripId: string,
    config?: {
        fields?: string[];
        page?: number;
        limit?: number;
        relative?: boolean;
    }
) => {
    const columns = {
        name: StagesTable.name,
        date: StagesTable.date,
        title: StagesTable.title,
        description: StagesTable.description,
        image: StagesTable.image,
        url: config?.relative
            ? sql`CONCAT('/', ${StagesTable.tripId}, '/', ${StagesTable.id})`
            : sql`CONCAT(${import.meta.env.SITE}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`
    };
    const query = db
        .select(filterObject(columns, config?.fields))
        .from(StagesTable)
        .where(
            and(eq(StagesTable.tripId, tripId), eq(StagesTable.published, true))
        );

    if (config?.page) {
        query.offset((config.page - 1) * (config.limit ?? 0));
    }
    if (config?.limit) {
        query.limit(config?.limit);
    }
    query.orderBy(StagesTable.date);
    return query;
};
