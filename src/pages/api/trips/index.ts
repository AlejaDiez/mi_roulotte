import TripsTable from "@schemas/trips";
import type { APIRoute } from "astro";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export const GET: APIRoute = async ({ locals, params, request }) => {
    const db = drizzle(locals.runtime.env.DB);

    const trips = await db
        .select({
            name: TripsTable.name,
            date: TripsTable.date,
            title: TripsTable.title,
            description: TripsTable.description,
            image: TripsTable.image,
            video: TripsTable.video,
            url: sql`${import.meta.env.SITE} || '/' || ${TripsTable.id}`,
        })
        .from(TripsTable)
        .where(eq(TripsTable.published, true));

    return new Response(JSON.stringify(trips), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
