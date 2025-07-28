import type { StagePreview } from "@models/stage";
import type { Trip } from "@models/trip";
import { StagesTable, TripsTable } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
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
const stageColumns = {
    id: StagesTable.id,
    name: StagesTable.name,
    date: StagesTable.date,
    title: StagesTable.title,
    description: StagesTable.description,
    image: StagesTable.image
};

export const getTripById = defineAction({
    input: z.object({
        id: z.string().default(""),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id, relative_url, fields },
        context
    ): Promise<
        Partial<Omit<Trip, "stages"> & { stages?: Partial<StagePreview>[] }>
    > => {
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

        let stagesData: Partial<StagePreview>[] | undefined = undefined;

        if (!fields || fields.some((e) => e.includes("stages"))) {
            const stageFields = fields
                ?.filter((f) => f.startsWith("stages."))
                .map((f) => f.replace("stages.", ""));
            const data = await db
                .select(filterObject(stageColumns, stageFields, ["id"]))
                .from(StagesTable)
                .where(
                    and(
                        eq(StagesTable.tripId, id),
                        eq(StagesTable.published, true)
                    )
                )
                .orderBy(StagesTable.date);

            stagesData = data.map((e) =>
                filterObject(
                    {
                        name: e.name,
                        date: e.date,
                        title: e.title,
                        description: e.description,
                        image: e.image,
                        url: relative_url
                            ? composeRelativeUrl(id, e.id!)
                            : composeUrl(id, e.id!)
                    },
                    stageFields
                )
            );
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
            stages: stagesData,
            keywords: data.keywords as string[] | null,
            published: data.published,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt
        };
    }
});
