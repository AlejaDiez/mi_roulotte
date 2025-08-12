import {
    buildRelatedComments,
    type PartialCommentPreview
} from "@models/comment";
import { selectComments, type ListDataType } from "@queries";
import { fields } from "@utils/filter_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getComments = defineAction({
    input: z.object({
        fields,
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialCommentPreview[]> => {
        const { fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data: ListDataType = await selectComments(
            db,
            undefined,
            undefined,
            {
                fields,
                relative
            }
        ).then((e) =>
            buildRelatedComments(
                e,
                fields?.length === 0 || fields?.includes("replies")
            )
        );

        return data;
    }
});
