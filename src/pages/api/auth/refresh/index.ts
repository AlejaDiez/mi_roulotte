import { json } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const POST: APIRoute = async ({ request, callAction }) => {
    const { token } = await json(request);

    return await callAction(actions.refreshToken, {
        token
    }).then((res) => response(res, 200));
};
