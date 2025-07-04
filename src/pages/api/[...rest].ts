import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ params }) => {
    const { rest } = params;

    return new Response(
        JSON.stringify({
            error: "NOT_FOUND",
            code: 404,
            message: `API route '/api/${rest}' not found`
        }),
        {
            status: 404,
            headers: { "Content-Type": "application/json" }
        }
    );
};
