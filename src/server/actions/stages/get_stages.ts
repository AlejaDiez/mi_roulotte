import type { StagePreview } from "@models/stage";
import { StagesTable, StagesTableColumns, TripsTable } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type PartialStagePreview = Partial<StagePreview>;

export const getStages = defineAction({
    input: z.object({
        id: z.string().default(""),
        relative_url: z.boolean().default(false),
        check_travel: z.boolean().default(true),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id, relative_url, check_travel, fields },
        context
    ): Promise<PartialStagePreview[]> => {
        const db = drizzle(context.locals.runtime.env.DB);

        // Check if trip exists
        if (check_travel) {
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
        }

        // Get data
        const data = await db
            .select(StagesTableColumns)
            .from(StagesTable)
            .where(
                and(eq(StagesTable.tripId, id), eq(StagesTable.published, true))
            )
            .orderBy(StagesTable.date);

        return data.map<PartialStagePreview>((e) =>
            filterObject(
                {
                    name: e.name,
                    date: e.date,
                    title: e.title,
                    description: e.description,
                    image: e.image,
                    url: relative_url
                        ? composeRelativeUrl(id, e.id)
                        : composeUrl(id, e.id)
                },
                { fields }
            )
        );
    }
});
