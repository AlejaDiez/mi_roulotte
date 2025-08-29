import type { PartialStagePreview } from "@models/stage";
import {
    countStages,
    type ListDataType,
    selectStages,
    tripExists
} from "@queries";
import { fields } from "@utils/filter_object";
import {
    limit,
    page,
    paginateObject,
    type Pagination
} from "@utils/paginate_object";
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
        fields,
        page,
        limit,
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
