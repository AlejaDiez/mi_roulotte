import { json } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const POST: APIRoute = async ({ request, callAction }) => {
    const { email, password, otp } = await json(request);

    return await callAction(actions.loginUser, {
        email,
        password,
        otp
    }).then((res) => response(res, 200));
};
