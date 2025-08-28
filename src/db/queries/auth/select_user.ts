import { UsersTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const selectUser = (
    db: DrizzleD1Database,
    userId: string,
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
        .select(filterObjectColumns(columns, config?.fields))
        .from(UsersTable)
        .where(eq(UsersTable.id, userId))
        .get();

    return query;
};

export const selectUserByEmail = (
    db: DrizzleD1Database,
    email: string,
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
        .select(filterObjectColumns(columns, config?.fields))
        .from(UsersTable)
        .where(eq(UsersTable.email, email))
        .get();

    return query;
};
