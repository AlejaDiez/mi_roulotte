import StagesTable from "@schemas/stages";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export const GET: APIRoute = async ({ locals, params }) => {
    const db = drizzle(locals.runtime.env.DB);
    const { trip_id, stage_id } = params;

    if (!trip_id || typeof trip_id !== "string") {
        return new Response(
            JSON.stringify({ error: "Invalid trip ID", code: 400 }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }
    if (!stage_id || typeof stage_id !== "string") {
        return new Response(
            JSON.stringify({ error: "Invalid stage ID", code: 400 }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const stage = await db
        .select()
        .from(StagesTable)
        .where(
            and(
                eq(StagesTable.tripId, trip_id),
                eq(StagesTable.id, stage_id),
                eq(StagesTable.published, true),
            ),
        )
        .get();

    if (!stage) {
        return new Response(
            JSON.stringify({
                error: `Stage with id '${stage_id}' not found on trip with id '${trip_id}'`,
                code: 404,
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify(stage), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
