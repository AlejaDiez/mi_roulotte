import { searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { trip } = params;
    const { fields } = searchParams(request);

    return await callAction(actions.getTripById, {
        tripId: trip!,
        fields
    }).then((res) => response(res, 200));
};
