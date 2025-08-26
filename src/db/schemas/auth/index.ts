import { sql } from "drizzle-orm";
import { integer, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export const UsersTable = table("users", {
    id: text("id")
        .primaryKey()
        .default(sql`(lower(hex(randomblob(16))))`),
    username: text("username").notNull(),
    email: text("email").notNull().unique(),
    password: text("password"),
    role: text("role")
        .notNull()
        .references(() => RolesTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade"
        }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    emailVerified: integer("email_verified", { mode: "boolean" })
        .notNull()
        .default(false),
    twoFactorAuthentication: integer("two_factor_authentication", {
        mode: "boolean"
    })
        .notNull()
        .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
});

export const RolesTable = table("roles", {
    id: text("id").primaryKey(),
    info: text("info")
});

export const SessionsTable = table("sessions", {
    id: text("id")
        .primaryKey()
        .default(sql`(lower(hex(randomblob(16))))`),
    userId: text("user_id")
        .notNull()
        .references(() => UsersTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade"
        }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    refreshToken: text("refresh_token").notNull(),
    revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
});

export const OtpsTable = table("otps", {
    id: text("id")
        .primaryKey()
        .default(sql`(lower(hex(randomblob(16))))`),
    userId: text("user_id")
        .notNull()
        .references(() => UsersTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade"
        }),
    code: text("code").notNull(),
    used: integer("used", { mode: "boolean" }).notNull().default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
});
