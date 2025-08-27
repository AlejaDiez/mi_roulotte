import type { UserCredentials } from "@models/user";
import {
    selectSession,
    selectUser,
    updateSession,
    type DataType
} from "@queries";
import { generateHash, generateToken, validateToken } from "@utils/crypto";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const refreshToken = defineAction({
    input: z.object({
        token: z
            .string({
                required_error: "token is required",
                invalid_type_error: "token must be a string"
            })
            .nonempty("token cannot be empty")
    }),
    handler: async (input, ctx): Promise<UserCredentials> => {
        const { token } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data = validateToken(token, import.meta.env.REFRESH_AUTH_SECRET);

        // Validate token
        if (!data) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message:
                    "Invalid or expired token, please login again to obtain a new token"
            });
        }

        let sessionData: DataType = await selectSession(db, data.id, data.uid, {
            fields: ["refresh"]
        });

        // Validate if session exists and rotated token matches the one in the database
        if (!sessionData || sessionData.refresh !== data.refresh) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message:
                    "Session not found, please login again to obtain a new token"
            });
        }

        // Update rotated token and return new access token
        sessionData = await updateSession(
            db,
            data.id,
            data.uid,
            {
                refresh: generateHash(),
                expiresIn: 60 * 60 * 24 * 30, // 30 days,
                userAgent: ctx.request.headers.get("user-agent"),
                ipAddress:
                    ctx.request.headers.get("CF-Connecting-IP") ??
                    ctx.request.headers.get("x-forwarded-for")
            },
            { fields: ["id", "uid", "refresh"] }
        );

        // Create token
        const userData: DataType = (await selectUser(db, sessionData.uid, {
            fields: ["id", "username", "role"]
        }))!;
        const newToken = generateToken(
            {
                id: userData.id,
                username: userData.username,
                role: userData.role
            },
            import.meta.env.AUTH_SECRET,
            60 * 15 // 15 min
        );

        // Create refresh token
        const newRefreshToken = generateToken(
            {
                id: sessionData.id,
                uid: sessionData.uid,
                refresh: sessionData.refresh
            },
            import.meta.env.REFRESH_AUTH_SECRET,
            60 * 60 * 24 * 30 // 30 days
        );

        return {
            token: newToken,
            refreshToken: newRefreshToken
        };
    }
});
