import type { Pagination } from "@interfaces/pagination";
import type { PartialTripPreview } from "@models/trip";
import { countTrips, selectTrips, type ListDataType } from "@queries";
import { paginateObject } from "@utils/paginate_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getTrips = defineAction({
    input: z.object({
        fields: z
            .string({
                invalid_type_error: "fields must be a string"
            })
            .or(
                z.array(z.string(), {
                    invalid_type_error: "fields must be an array of strings"
                })
            )
            .optional()
            .transform((e) => (typeof e === "string" ? [e] : e)),
        page: z
            .number({
                invalid_type_error: "page must be a number"
            })
            .int("page must be an integer number")
            .positive("page must be a positive number")
            .optional(),
        limit: z
            .number({
                invalid_type_error: "limit must be a number"
            })
            .int("limit must be an integer number")
            .positive("limit must be a positive number")
            .optional(),
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
