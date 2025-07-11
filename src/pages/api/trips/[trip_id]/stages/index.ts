import StagesTable from "@schemas/stages";
import TripsTable from "@schemas/trips";
import type { APIRoute } from "astro";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export const GET: APIRoute = async ({ locals, params, request }) => {
    const db = drizzle(locals.runtime.env.DB);
    const { trip_id } = params;

    if (!trip_id || typeof trip_id !== "string") {
        return new Response(
            JSON.stringify({ error: "Invalid trip ID", code: 400 }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const trip = await db
        .select({ id: TripsTable.id })
        .from(TripsTable)
        .where(and(eq(TripsTable.id, trip_id), eq(TripsTable.published, true)))
        .get();

    if (!trip) {
        return new Response(
            JSON.stringify({
                error: `Trip with id '${trip_id}' not found`,
                code: 404,
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
        );
    }

    const stages = await db
        .select({
            name: StagesTable.name,
            date: StagesTable.date,
            title: StagesTable.title,
            description: StagesTable.description,
            image: StagesTable.image,
            url: sql`${import.meta.env.SITE} || '/' || ${StagesTable.tripId} || '/' || ${StagesTable.id}`,
        })
        .from(StagesTable)
        .where(
            and(
                eq(StagesTable.tripId, trip_id),
                eq(StagesTable.published, true),
            ),
        )
        .orderBy(StagesTable.date);

    return new Response(JSON.stringify(stages), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
