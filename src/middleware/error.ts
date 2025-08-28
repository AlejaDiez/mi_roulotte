import type { APIContext, MiddlewareHandler, MiddlewareNext } from "astro";
import { ActionInputError } from "astro:actions";

export const error: MiddlewareHandler = async (
    ctx: APIContext,
    next: MiddlewareNext
) => {
    return await next().catch(
        (err) =>
            new Response(
                JSON.stringify({
                    error: err.code,
                    code: err.status,
                    message:
                        err instanceof ActionInputError
                            ? [...Object.values(err.fields)].flat()
                            : err.message
                }),
                {
                    status: err.status,
                    headers: { "Content-Type": "application/json" }
                }
            )
    );
};
