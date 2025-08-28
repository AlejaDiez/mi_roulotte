import type { UserRoles } from "@models/user";
import { validateToken } from "@utils/crypto";
import { headers } from "@utils/request";
import type {
    APIContext,
    APIRoute,
    MiddlewareHandler,
    MiddlewareNext
} from "astro";
import { ActionError } from "astro:actions";

const routes: URLPattern[] = [
    new URLPattern({ pathname: "/api/comments" }),
    new URLPattern({ pathname: "/api/comments/*" }),
    new URLPattern({ pathname: "/api/files" }),
    new URLPattern({ pathname: "/api/files/*" }),
    new URLPattern({ pathname: "/api/trips" }),
    new URLPattern({ pathname: "/api/trips/*" })
];

export const auth: MiddlewareHandler = async (
    ctx: APIContext,
    next: MiddlewareNext
) => {
    if (routes.some((url) => url.test(ctx.request.url))) {
        const { authorization } = headers(ctx.request);

        // Check if the request send authorization
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
};

export const requireRole = (role: UserRoles, handler: APIRoute): APIRoute => {
    return async (ctx) => {
        const roleHierarchy = ["reader", "editor", "admin"];
        const userRole = ctx.locals.role;

        if (roleHierarchy.indexOf(userRole) < roleHierarchy.indexOf(role)) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: `This action requires at least ${role} privileges`
            });
        }
        return await handler(ctx);
    };
};
