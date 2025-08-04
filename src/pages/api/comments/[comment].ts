import { deleteComment, getCommentById, replyComment } from "@actions";
import { getBody, getQueryParams } from "@utils/request";
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

export const POST: APIRoute = async ({ params, request, callAction }) => {
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

    const { comment } = params;
    const body = await getBody(request);
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(replyComment, {
        id: Number(comment),
        body,
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
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
};

export const DELETE: APIRoute = async ({ params, callAction }) => {
    const { comment } = params;
    const { error } = await callAction(deleteComment, {
        id: Number(comment)
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
    return new Response(null, {
        status: 204,
        headers: { "Content-Type": "application/json" }
    });
};
