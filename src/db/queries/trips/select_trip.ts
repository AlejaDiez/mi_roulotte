import { TripsTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectTrip = (
    db: DrizzleD1Database,
    tripId: string,
    config?: {
        fields?: string[];
        relative?: boolean;
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
        url: config?.relative
            ? sql`CONCAT('/', ${TripsTable.id})`
            : sql`CONCAT(${import.meta.env.SITE}, '/', ${TripsTable.id})`,
        allowComments: TripsTable.allowComments,
        createdAt: TripsTable.createdAt,
        modifiedAt: TripsTable.modifiedAt
    };

    return db
        .select(filterObject(columns, config?.fields))
        .from(TripsTable)
        .where(and(eq(TripsTable.id, tripId), eq(TripsTable.published, true)))
        .get();
};
