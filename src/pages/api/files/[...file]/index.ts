import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

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
