import type { PartialUploadedFile } from "@interfaces/files";
import { filterObject } from "@utils/filter_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const getFiles = defineAction({
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
            .transform((e) => (typeof e === "string" ? [e] : e))
    }),
    handler: async (input, ctx): Promise<PartialUploadedFile[]> => {
        const { fields } = input;
        const bucket = ctx.locals.runtime.env.BUCKET;
        const res = await bucket.list({
            include: ["httpMetadata"]
        });

        return res.objects.map((e) =>
            filterObject(
                {
                    name: e.key.split("/").pop()!,
                    type: e.httpMetadata?.contentType,
                    size: e.size,
                    url: `${ctx.locals.runtime.env.SITE ?? import.meta.env.SITE}/${e.key}`,
                    uploadedAt: e.uploaded
                },
                fields
            )
        );
    }
});
