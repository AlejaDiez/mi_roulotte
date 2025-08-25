import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const getFileById = defineAction({
    input: z.object({
        fileId: z
            .string({
                required_error: "file id is required",
                invalid_type_error: "file id must be a string"
            })
            .nonempty("file id cannot be empty")
    }),
    handler: async (input, ctx): Promise<R2ObjectBody> => {
        const { fileId } = input;
        const bucket = ctx.locals.runtime.env.BUCKET;
        const res = await bucket.get(fileId);

        if (!res) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `File with id '${fileId}' not found`
            });
        }
        return res;
    }
});
