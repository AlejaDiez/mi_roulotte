import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, callAction }) => {
    const { file } = params;
    const { data, error } = await callAction(actions.getFileById, {
        fileId: file!
    });

    if (error) {
        return new Response(JSON.stringify(getErrorObject(error)), {
            status: error.status,
            headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(data.body, {
        status: 200,
        headers: {
            "X-Filename": data.key.split("/").pop()!,
            "Content-Type":
                data.httpMetadata!.contentType ?? "application/octet-stream",
            "Content-Length": data.size.toString(),
            "Last-Modified": data.uploaded.toUTCString(),
            "Cache-Control":
                data.httpMetadata!.cacheControl ?? "public, max-age=3600"
        }
    });
};

export const DELETE: APIRoute = async ({ params, callAction }) => {
    const { file } = params;
    const { error } = await callAction(actions.deleteFile, {
        fileId: file!
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
