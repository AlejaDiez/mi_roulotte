import { SessionsTable } from "@schemas";
import { and, eq, lt, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const deleteSession = (
    db: DrizzleD1Database,
    sessionId: string,
    userId: string
) => {
    return db
        .delete(SessionsTable)
        .where(
            and(eq(SessionsTable.id, sessionId), eq(SessionsTable.uid, userId))
        )
        .returning({ id: SessionsTable.id })
        .get();
};

export const deleteSessions = (db: DrizzleD1Database, userId: string) => {
    return db
        .delete(SessionsTable)
        .where(eq(SessionsTable.uid, userId))
        .returning({ id: SessionsTable.id });
};

export const deleteExpiredSessions = (db: DrizzleD1Database) => {
    return db
        .delete(SessionsTable)
        .where(lt(SessionsTable.expiresAt, sql`(unixepoch())`))
        .returning({ id: SessionsTable.id });
};
