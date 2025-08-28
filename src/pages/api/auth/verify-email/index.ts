import { searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const PUT: APIRoute = async ({ request, callAction }) => {
    const { token } = searchParams(request);

    return await callAction(actions.verifyEmail, {
        token
    }).then((res) => response(res, 200));
};
