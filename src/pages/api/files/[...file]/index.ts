import { requireRole } from "@middlewares/auth";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = requireRole(
    "editor",
    async ({ params, callAction }) => {
        const { file } = params;
        const { data, error } = await callAction(actions.getFileById, {
            fileId: file!
        });

        if (error) {
            throw error;
        } else {
            return new Response(data.body, {
                status: 200,
                headers: {
                    "X-Filename": data.key.split("/").pop()!,
                    "Content-Type":
                        data.httpMetadata!.contentType ??
                        "application/octet-stream",
                    "Content-Length": data.size.toString(),
                    "Last-Modified": data.uploaded.toUTCString(),
                    "Cache-Control":
                        data.httpMetadata!.cacheControl ??
                        "public, max-age=3600"
                }
            });
        }
    }
);

export const DELETE: APIRoute = requireRole(
    "editor",
    async ({ params, callAction }) => {
        const { file } = params;

        return await callAction(actions.deleteFile, {
            fileId: file!
        }).then((res) => response(res, 204));
    }
);
