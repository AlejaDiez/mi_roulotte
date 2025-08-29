import { TripsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectTrip = (
    db: DrizzleD1Database,
    tripId: string,
    config?: {
        fields?: string[];
        site?: string;
    }
) => {
    const columns = {
        _allowComments: TripsTable.allowComments,
        id: TripsTable.id,
        name: TripsTable.name,
        date: TripsTable.date,
        title: TripsTable.title,
        description: TripsTable.description,
        image: TripsTable.image,
        video: TripsTable.video,
        content: TripsTable.content,
        keywords: TripsTable.keywords,
        published: TripsTable.published,
        url: sql`CONCAT(${config?.site ?? ""}, '/', ${TripsTable.id})`,
        allowComments: TripsTable.allowComments,
        createdAt: TripsTable.createdAt,
        updatedAt: TripsTable.updatedAt
    };

    return db
        .select(filterObjectColumns(columns, config?.fields))
        .from(TripsTable)
        .where(and(eq(TripsTable.id, tripId), eq(TripsTable.published, true)))
        .get();
};
