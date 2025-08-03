import { addNewComment, getComments } from "@actions";
import { getBody, getQueryParams } from "@utils/request";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, callAction }) => {
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(getComments, { fields });

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

export const POST: APIRoute = async ({ request, callAction }) => {
    const { headers } = request;

    if (headers.get("Content-Type") !== "application/json") {
        return new Response(
            JSON.stringify({
                error: "UNSUPPORTED_MEDIA_TYPE",
                code: 415,
                message: "Content-Type must be application/json"
            }),
            { status: 415, headers: { "Content-Type": "application/json" } }
        );
    }

    const body = await getBody(request);
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(addNewComment, { body, fields });

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
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
};
