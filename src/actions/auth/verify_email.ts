import { updateUser } from "@queries";
import { validateToken } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const verifyEmail = defineAction({
    input: z.object({
        token: z
            .string({
                invalid_type_error: "token must be a string",
                required_error: "token is required"
            })
            .nonempty("token must not be empty")
    }),
    handler: async (input, ctx): Promise<void> => {
        const { token } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Validate token
        const data = validateToken(token, import.meta.env.VERIFY_EMAIL_SECRET);

        if (!data) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message: "Invalid or expired token"
            });
        }

        // Update user verufication status
        const updated = await updateUser(
            db,
            data.id,
            { emailVerified: true },
            { fields: ["id"] }
        );

        if (!updated) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${data.id}' was not found or may have been deleted`
            });
        }
    }
});
