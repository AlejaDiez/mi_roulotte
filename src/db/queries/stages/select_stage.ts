import { StagesTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectStage = (
    db: DrizzleD1Database,
    tripId: string,
    stageId: string,
    config?: {
        fields?: string[];
        site?: string;
    }
) => {
    const columns = {
        _allowComments: StagesTable.allowComments,
        id: StagesTable.id,
        name: StagesTable.name,
        date: StagesTable.date,
        title: StagesTable.title,
        description: StagesTable.description,
        image: StagesTable.image,
        content: StagesTable.content,
        keywords: StagesTable.keywords,
        published: StagesTable.published,
        url: sql`CONCAT(${config?.site ?? ""}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`,
        allowComments: StagesTable.allowComments,
        createdAt: StagesTable.createdAt,
        updatedAt: StagesTable.updatedAt
    };

    return db
        .select(filterObjectColumns(columns, config?.fields))
        .from(StagesTable)
        .where(
            and(
                eq(StagesTable.tripId, tripId),
                eq(StagesTable.id, stageId),
                eq(StagesTable.published, true)
            )
        )
        .get();
};
