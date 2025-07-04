import type { Trip } from "@models/trip";
import { TripsTable } from "@schemas";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

const tripColumns = {
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
    createdAt: TripsTable.createdAt,
    modifiedAt: TripsTable.modifiedAt
};

export const getTripById = defineAction({
    input: z.object({
        id: z.string().default(""),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async ({ id, fields }, context): Promise<Partial<Trip>> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .select(filterObject(tripColumns, fields))
            .from(TripsTable)
            .where(and(eq(TripsTable.id, id), eq(TripsTable.published, true)))
            .get();

        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${id}' not found`
            });
        }

        return {
            id: data.id,
            name: data.name,
            date: data.date,
            title: data.title,
            description: data.description,
            image: data.image,
            video: data.video,
            content: data.content as object[],
            keywords: data.keywords as string[] | null,
            published: data.published,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt
        };
    }
});
