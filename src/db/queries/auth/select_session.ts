import { SessionsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, gte, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectSession = (
    db: DrizzleD1Database,
    sessionId: string,
    userId: string,
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
        .select(filterObjectColumns(columns, config?.fields))
        .from(SessionsTable)
        .where(
            and(
                eq(SessionsTable.id, sessionId),
                eq(SessionsTable.uid, userId),
                gte(SessionsTable.expiresAt, sql`(unixepoch())`)
            )
        )
        .get();

    return query;
};
