import { searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ request, callAction }) => {
    const { fields, page, limit } = searchParams(request);

    return await callAction(actions.getTrips, {
        fields,
        page,
        limit
    }).then((res) => response(res, 200));
};
