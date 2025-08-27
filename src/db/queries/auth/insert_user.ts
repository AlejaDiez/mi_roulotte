import { UsersTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const insertUser = (
    db: DrizzleD1Database,
    value: {
        username: string;
        email: string;
        password: string;
        role: string;
    },
    config?: {
        fields?: string[];
    }
) => {
    const columns = {
        id: UsersTable.id,
        username: UsersTable.username,
        email: UsersTable.email,
        password: UsersTable.password,
        role: UsersTable.role,
        isActive: UsersTable.isActive,
        emailVerified: UsersTable.emailVerified,
        twoFactorAuthentication: UsersTable.twoFactorAuthentication,
        createdAt: UsersTable.createdAt,
        updatedAt: UsersTable.updatedAt
    };
    const query = db
        .insert(UsersTable)
        .values({
            username: value.username,
            email: value.email,
            password: value.password,
            role: value.role
        })
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
