import type { PartialTripPreview } from "@models/trip";
import { countTrips, selectTrips, type ListDataType } from "@queries";
import { fields } from "@utils/filter_object";
import {
    limit,
    page,
    paginateObject,
    type Pagination
} from "@utils/paginate_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getTrips = defineAction({
    input: z.object({
        fields,
        page,
        limit,
        relative: z.boolean().default(false)
    }),
    handler: async (
        input,
        ctx
    ): Promise<PartialTripPreview[] | Pagination<PartialTripPreview>> => {
        const { fields, page, limit, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data: ListDataType = await selectTrips(db, {
            fields,
            page,
            limit,
            site: !relative
                ? (ctx.locals.runtime.env.SITE ?? import.meta.env.SITE)
                : undefined
        }).then((e) => e.map(({ _, ...e }: any) => e));

        return paginateObject(
            data,
            page,
            limit,
            async () => await countTrips(db).then((e) => e!.count)
        );
    }
});
