import type { StagePreview } from "@models/stage";
import { StagesTable, TripsTable } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

const stageColumns = {
    id: StagesTable.id,
    name: StagesTable.name,
    date: StagesTable.date,
    title: StagesTable.title,
    description: StagesTable.description,
    image: StagesTable.image
};

export const getStages = defineAction({
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
    ): Promise<Partial<StagePreview>[]> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const exists = !!(await db
            .select({ id: TripsTable.id })
            .from(TripsTable)
            .where(eq(TripsTable.id, id))
            .get());

        if (!exists) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${id}' does not exist`
            });
        }

        const data = await db
            .select(filterObject(stageColumns, fields, ["id"]))
            .from(StagesTable)
            .where(
                and(eq(StagesTable.tripId, id), eq(StagesTable.published, true))
            )
            .orderBy(StagesTable.date);

        return data.map<Partial<StagePreview>>((e) =>
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
                fields
            )
        );
    }
});
