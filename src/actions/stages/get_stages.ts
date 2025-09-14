import type { Pagination } from "@interfaces/pagination";
import type { PartialStagePreview } from "@models/stage";
import {
    countStages,
    type ListDataType,
    selectStages,
    tripExists
} from "@queries";
import { paginateObject } from "@utils/paginate_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getStages = defineAction({
    input: z.object({
        tripId: z
            .string({
                invalid_type_error: "tripId must be a string",
                required_error: "tripId is required"
            })
            .nonempty("tripId must not be empty"),
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
    ): Promise<PartialStagePreview[] | Pagination<PartialStagePreview>> => {
        const { tripId, fields, page, limit, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Trip exists???
        if (!(await tripExists(db, tripId))) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${tripId}' not found`
            });
        }

        const data: ListDataType = await selectStages(db, tripId, {
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
            async () => await countStages(db, tripId).then((e) => e!.count)
        );
    }
});
