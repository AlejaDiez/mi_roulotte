import { getQueryParams } from "@utils/request";
import { getErrorObject } from "@utils/response";
import type { APIRoute } from "astro";
import { actions } from "astro:actions";

export const GET: APIRoute = async ({ params, request, callAction }) => {
    const { trip, stage } = params;
    const { fields } = getQueryParams(request);
    const { data, error } = await callAction(actions.getStageById, {
        tripId: trip!,
        stageId: stage!,
        fields
    });

    if (error) {
        return new Response(JSON.stringify(getErrorObject(error)), {
            status: error.status,
            headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
};
