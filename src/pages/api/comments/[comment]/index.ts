import { getBody, getQueryParams } from "@utils/request";
import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { comment } = params;
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(actions.getCommentById, {
        commentId: comment!,
        fields
    });

    if (error) {
        return new Response(JSON.stringify(getErrorObject(error)), {
            status: error.status,
            headers: { "Content-Type": "application/json" }
        });
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
    const { data, error } = await callAction(actions.replyComment, {
        commentId: comment!,
        body: body as any,
        fields
    });

    if (error) {
        return new Response(JSON.stringify(getErrorObject(error)), {
            status: error.status,
            headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
};

export const DELETE: APIRoute = async ({ params, callAction }) => {
    const { comment } = params;
    const { error } = await callAction(actions.deleteComment, {
        commentId: comment!
    });

    if (error) {
        return new Response(JSON.stringify(getErrorObject(error)), {
            status: error.status,
            headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(null, {
        status: 204,
        headers: { "Content-Type": "application/json" }
    });
};
