import { searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { trip } = params;
    const { fields, page, limit } = searchParams(request);

    return await callAction(actions.getStages, {
        tripId: trip!,
        fields,
        page,
        limit
    }).then((res) => response(res, 200));
};
