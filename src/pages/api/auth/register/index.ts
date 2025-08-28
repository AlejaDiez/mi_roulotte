import { json, searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const POST: APIRoute = async ({ request, callAction }) => {
    const { fields } = searchParams(request);
    const body: any = await json(request);

    return await callAction(actions.registerUser, {
        body,
        fields
    }).then((res) => response(res, 201));
};
