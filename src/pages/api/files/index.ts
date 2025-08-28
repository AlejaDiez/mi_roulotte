import { requireRole } from "@middlewares/auth";
import { arrayBuffer, headers, searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = requireRole(
    "editor",
    async ({ request, callAction }) => {
        const { fields } = searchParams(request);

        return await callAction(actions.getFiles, {
            fields
        }).then((res) => response(res, 200));
    }
);

export const POST: APIRoute = requireRole(
    "editor",
    async ({ request, callAction }) => {
        const { width, height, rotate, quality, format, fields } =
            searchParams(request);
        const { "x-filename": name, "content-type": type } = headers(request);
        const buffer = await arrayBuffer(request);

        return await callAction(actions.uploadFile, {
            file: { buffer, name, type },
            transform: {
                width,
                height,
                rotate,
                quality,
                format
            },
            fields
        }).then((res) => response(res, 201));
    }
);
