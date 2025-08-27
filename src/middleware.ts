import { validateToken } from "@utils/crypto";
import { getHeaders } from "@utils/request";
import { defineMiddleware } from "astro:middleware";
import { URLPattern } from "node:url";

const blockedRoutes: URLPattern[] = [
    new URLPattern({ pathname: "/api/comments" }),
    new URLPattern({ pathname: "/api/comments/*" }),
    new URLPattern({ pathname: "/api/files" }),
    new URLPattern({ pathname: "/api/files/*" }),
    new URLPattern({ pathname: "/api/trips" }),
    new URLPattern({ pathname: "/api/trips/*" })
];

export const onRequest = defineMiddleware(async (ctx, next) => {
    // Check if authorization is needed
    if (blockedRoutes.some((e) => e.test(ctx.request.url))) {
        const { authorization } = getHeaders(ctx.request);

        if (!authorization?.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({
                    error: "UNAUTHORIZED",
                    code: 401,
                    message: "This endpoint requires authentication"
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const data = validateToken(
            authorization.replace("Bearer ", ""),
            import.meta.env.AUTH_SECRET
        );

        // Validate token
        if (!data) {
            return new Response(
                JSON.stringify({
                    error: "UNAUTHORIZED",
                    code: 401,
                    message:
                        "Invalid or expired token, please refresh the token"
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }
        // Save user data
        ctx.locals.uid = data.id;
        ctx.locals.role = data.role;
        ctx.locals.username = data.username;
    }
    return next();
});
