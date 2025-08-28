import type { APIRoute } from "astro";
import { ActionError } from "astro:actions";

export const ALL: APIRoute = ({ params }) => {
    const { rest } = params;

    throw new ActionError({
        code: "NOT_FOUND",
        message: `API route '/api/${rest}' not found`
    });
};
