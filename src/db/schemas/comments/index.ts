import { TripsTable } from "@schemas";
import { sql } from "drizzle-orm";
import {
    foreignKey,
    integer,
    sqliteTable as table,
    text
} from "drizzle-orm/sqlite-core";

export const CommentsTable = table(
    "comments",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        tripId: text("trip_id")
            .notNull()
            .references(() => TripsTable.id, {
                onUpdate: "cascade",
                onDelete: "cascade"
            }),
        stageId: text("stage_id"),
        username: text("username").notNull(),
        email: text("email"),
        content: text("content").notNull(),
        repliedTo: integer("replied_to"),
        createdAt: integer("created_at", { mode: "timestamp" })
            .notNull()
            .default(sql`(unixepoch())`),
        modifiedAt: integer("modified_at", { mode: "timestamp" })
    },
    (self) => [
        foreignKey({
            columns: [self.repliedTo],
            foreignColumns: [self.id]
        })
            .onUpdate("cascade")
            .onDelete("cascade")
    ]
);
