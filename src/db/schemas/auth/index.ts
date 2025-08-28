import { sql } from "drizzle-orm";
import { integer, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export const UsersTable = table("users", {
    id: text("id")
        .primaryKey()
        .default(sql`(lower(hex(randomblob(16))))`),
    username: text("username").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text({ enum: ["admin", "editor", "reader"] })
        .notNull()
        .default("reader"),
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

export const SessionsTable = table("sessions", {
    id: text("id")
        .primaryKey()
        .default(sql`(lower(hex(randomblob(16))))`),
    uid: text("uid")
        .notNull()
        .references(() => UsersTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade"
        }),
    refresh: text("refresh", { length: 6 }).notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
});

export const OTPsTable = table("otps", {
    uid: text("uid")
        .primaryKey()
        .references(() => UsersTable.id, {
            onUpdate: "cascade",
            onDelete: "cascade"
        }),
    code: text("code", { length: 6 })
        .notNull()
        .default(sql`(printf('%06d', ABS(RANDOM()) % 1000000))`),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
});
