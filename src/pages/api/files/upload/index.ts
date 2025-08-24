import { getQueryParams } from "@utils/request";
import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const POST: APIRoute = async ({ request, callAction }) => {
    const { width, height, rotate, quality, format } = getQueryParams(request);
    const { data, error } = await callAction(actions.uploadFile, {
        file: {
            buffer: await request.arrayBuffer(),
            name: request.headers.get("X-Filename") as any,
            type: request.headers.get("Content-Type") as any
        },
        transform: {
            width: width,
            height: height,
            rotate: rotate,
            quality: quality,
            format: format
        }
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
