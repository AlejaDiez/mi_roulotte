import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const deleteFile = defineAction({
    input: z.object({
        fileId: z
            .string({
                required_error: "file id is required",
                invalid_type_error: "file id must be a string"
            })
            .nonempty("file id cannot be empty")
    }),
    handler: async (input, ctx): Promise<void> => {
        const { fileId } = input;
        const bucket = ctx.locals.runtime.env.BUCKET;

        return await bucket.delete(fileId);
    }
});
