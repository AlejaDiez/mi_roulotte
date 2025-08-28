import { OTPsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const insertOTP = (
    db: DrizzleD1Database,
    value: {
        userId: string;
        code?: string;
        expiresIn: number;
    },
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
        .insert(OTPsTable)
        .values({
            uid: value.userId,
            code: value.code,
            expiresAt: sql`(unixepoch() + ${value.expiresIn})`
        })
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
