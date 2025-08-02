import type { TripPreview } from "@models/trip";
import { TripsTable, TripsTableColumns } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type PartialTripPreview = Partial<TripPreview>;

export const getTrips = defineAction({
    input: z.object({
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { relative_url, fields },
        context
    ): Promise<PartialTripPreview[]> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .select(TripsTableColumns)
            .from(TripsTable)
            .where(eq(TripsTable.published, true))
            .orderBy(TripsTable.date);

        return data.map<PartialTripPreview>((e) =>
            filterObject(
                {
                    name: e.name,
                    date: e.date,
                    title: e.title,
                    description: e.description,
                    image: e.image,
                    video: e.video,
                    url: relative_url
                        ? composeRelativeUrl(e.id)
                        : composeUrl(e.id)
                },
                { fields }
            )
        );
    }
});
