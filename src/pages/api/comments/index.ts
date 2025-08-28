import { json, searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ request, callAction }) => {
    const { fields } = searchParams(request);

    return await callAction(actions.getComments, {
        fields
    }).then((res) => response(res, 200));
};

export const POST: APIRoute = async ({ request, callAction }) => {
    const { fields } = searchParams(request);
    const body: any = await json(request);

    return await callAction(actions.addNewComment, {
        body,
        fields
    }).then((res) => response(res, 201));
};
