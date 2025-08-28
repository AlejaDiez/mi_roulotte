import type { UserRoles } from "@models/user";
import { UsersTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const updateUser = (
    db: DrizzleD1Database,
    userId: string,
    value: {
        username?: string;
        email?: string;
        password?: string;
        role?: UserRoles;
        isActive?: boolean;
        emailVerified?: boolean;
        twoFactorAuthentication?: boolean;
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
        .update(UsersTable)
        .set({
            username: value.username,
            email: value.email,
            password: value.password,
            role: value.role,
            isActive: value.isActive,
            emailVerified: value.emailVerified,
            twoFactorAuthentication: value.twoFactorAuthentication
        })
        .where(eq(UsersTable.id, userId))
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
