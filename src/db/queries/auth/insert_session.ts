import { SessionsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const insertSession = (
    db: DrizzleD1Database,
    value: {
        userId: string;
        refresh: string;
        expiresIn: number;
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
        .insert(SessionsTable)
        .values({
            uid: value.userId,
            refresh: value.refresh,
            userAgent: value.userAgent,
            ipAddress: value.ipAddress,
            expiresAt: sql`(unixepoch() + ${value.expiresIn})`
        })
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
