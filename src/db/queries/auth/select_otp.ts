import { OTPsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { and, eq, gte, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectOTP = (
    db: DrizzleD1Database,
    userId: string,
    code: string,
    config?: {
        fields?: string[];
    }
) => {
    const columns = {
        uid: OTPsTable.uid,
        code: OTPsTable.code,
        createdAt: OTPsTable.createdAt,
        expiresAt: OTPsTable.expiresAt
    };
    const query = db
        .select(filterObjectColumns(columns, config?.fields))
        .from(OTPsTable)
        .where(
            and(
                eq(OTPsTable.uid, userId),
                eq(OTPsTable.code, code),
                gte(OTPsTable.expiresAt, sql`(unixepoch())`)
            )
        )
        .get();

    return query;
};
