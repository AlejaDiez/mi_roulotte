import { StagesTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectStages = (
    db: DrizzleD1Database,
    tripId: string,
    config?: {
        fields?: string[];
        page?: number;
        limit?: number;
        site?: string;
    }
) => {
    const columns = {
        name: StagesTable.name,
        date: StagesTable.date,
        title: StagesTable.title,
        description: StagesTable.description,
        image: StagesTable.image,
        url: sql`CONCAT(${config?.site ?? ""}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`
    };
    const query = db
        .select(filterObjectColumns(columns, config?.fields))
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
