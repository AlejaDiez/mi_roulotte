import { getBody, getQueryParams } from "@utils/request";
import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ request, callAction }) => {
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(actions.getComments, {
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
    const { data, error } = await callAction(actions.addNewComment, {
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
