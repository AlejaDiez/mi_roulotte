import { requireRole } from "@middlewares/auth";
import { json, searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { comment } = params;
    const { fields } = searchParams(request);

    return await callAction(actions.getCommentById, {
        commentId: comment!,
        fields
    }).then((res) => response(res, 200));
};

export const POST: APIRoute = async ({ params, request, callAction }) => {
    const { comment } = params;
    const { fields } = searchParams(request);
    const body: any = await json(request);

    return await callAction(actions.replyComment, {
        commentId: comment!,
        body,
        fields
    }).then((res) => response(res, 201));
};

export const DELETE: APIRoute = requireRole(
    "editor",
    async ({ params, callAction }) => {
        const { comment } = params;

        return await callAction(actions.deleteComment, {
            commentId: comment!
        }).then((res) => response(res, 204));
    }
);
