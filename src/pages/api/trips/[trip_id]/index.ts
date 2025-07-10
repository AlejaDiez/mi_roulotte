import TripsTable from "@schemas/trips";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export const GET: APIRoute = async ({ locals, params }) => {
    const db = drizzle(locals.runtime.env.DB);
    const { trip_id } = params;

    if (!trip_id || typeof trip_id !== "string") {
        return new Response(
            JSON.stringify({ error: "Invalid trip ID", code: 400 }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const [trip] = await db.select().from(TripsTable).where(eq(TripsTable.id, trip_id));

    if (!trip) {
        return new Response(
            JSON.stringify({
                error: `Trip with id '${trip_id}' not found`,
                code: 404,
            }),
            { status: 404, headers: { "Content-Type": "application/json" } },
        );
    }
    return new Response(JSON.stringify(trip), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
