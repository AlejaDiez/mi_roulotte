import { searchParams } from "@utils/request";
import { response } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { trip, stage } = params;
    const { fields } = searchParams(request);

    return await callAction(actions.getStageById, {
        tripId: trip!,
        stageId: stage!,
        fields
    }).then((res) => response(res, 200));
};
