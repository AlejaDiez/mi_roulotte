import {
    buildRelatedComments,
    type PartialCommentPreview
} from "@models/comment";
import { selectComments, type ListDataType } from "@queries";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getComments = defineAction({
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
                site: !relative
                    ? (ctx.locals.runtime.env.SITE ?? import.meta.env.SITE)
                    : undefined
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
