import { getCommentById } from "@actions";
import { getQueryParams } from "@utils/request";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { comment } = params;
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(getCommentById, {
        id: Number(comment),
        fields
    });

    if (error) {
        return new Response(
            JSON.stringify({
                error: error.code,
                code: error.status,
                message: error.message
            }),
            {
                status: error.status,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
};
