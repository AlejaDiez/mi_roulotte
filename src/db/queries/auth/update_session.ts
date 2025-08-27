import { SessionsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const updateSession = (
    db: DrizzleD1Database,
    sessionId: string,
    userId: string,
    value: {
        refresh?: string;
        expiresIn?: number;
        userAgent?: string | null;
        ipAddress?: string | null;
    },
    config?: {
        fields?: string[];
    }
) => {
    const columns = {
        id: SessionsTable.id,
        uid: SessionsTable.uid,
        refresh: SessionsTable.refresh,
        userAgent: SessionsTable.userAgent,
        ipAddress: SessionsTable.ipAddress,
        createdAt: SessionsTable.createdAt,
        updatedAt: SessionsTable.updatedAt,
        expiresAt: SessionsTable.expiresAt
    };
    const query = db
        .update(SessionsTable)
        .set({
            refresh: value.refresh,
            userAgent: value.userAgent,
            ipAddress: value.ipAddress,
            expiresAt: sql`(unixepoch() + ${value.expiresIn})`
        })
        .where(
            and(eq(SessionsTable.id, sessionId), eq(SessionsTable.uid, userId))
        )
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
