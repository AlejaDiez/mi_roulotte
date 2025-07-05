import type { Stage } from "@models/stage";
import { StagesTable, TripsTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

const tripColumns = {
    id: StagesTable.id,
    tripId: StagesTable.tripId,
    name: StagesTable.name,
    date: StagesTable.date,
    title: StagesTable.title,
    description: StagesTable.description,
    image: StagesTable.image,
    content: StagesTable.content,
    keywords: StagesTable.keywords,
    published: StagesTable.published,
    createdAt: StagesTable.createdAt,
    modifiedAt: StagesTable.modifiedAt
};

export const getStageById = defineAction({
    input: z.object({
        id: z.tuple([z.string().default(""), z.string().default("")]),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id: [tripId, stageId], fields },
        context
    ): Promise<Partial<Stage>> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const exists = !!(await db
            .select({ id: TripsTable.id })
            .from(TripsTable)
            .where(eq(TripsTable.id, tripId))
            .get());

        if (!exists) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${tripId}' does not exist`
            });
        }

        const data = await db
            .select(filterObject(tripColumns, fields))
            .from(StagesTable)
            .where(
                and(
                    eq(StagesTable.tripId, tripId),
                    eq(StagesTable.id, stageId),
                    eq(StagesTable.published, true)
                )
            )
            .get();

        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Stage with id '${stageId}' not found`
            });
        }
        return {
            id: data.id,
            tripId: data.tripId,
            name: data.name,
            date: data.date,
            title: data.title,
            description: data.description,
            image: data.image,
            content: data.content as object[],
            keywords: data.keywords as string[] | null,
            published: data.published,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt
        };
    }
});
