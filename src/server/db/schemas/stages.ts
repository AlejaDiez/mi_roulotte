import { sql } from "drizzle-orm";
import {
    integer,
    primaryKey,
    sqliteTable as table,
    text
} from "drizzle-orm/sqlite-core";
import { TripsTable } from "./trips";

export const StagesTable = table(
    "stages",
    {
        id: text("id").notNull(),
        tripId: text("trip_id")
            .notNull()
            .references(() => TripsTable.id, {
                onUpdate: "cascade",
                onDelete: "cascade"
            }),
        name: text("name").notNull(),
        date: integer("date", { mode: "timestamp" }).notNull(),
        title: text("title").notNull(),
        description: text("description"),
        image: text("image"),
        content: text("content", { mode: "json" }).notNull().default("[]"),
        keywords: text("keywords", { mode: "json" }),
        published: integer("published", { mode: "boolean" })
            .notNull()
            .default(false),
        createdAt: integer("created_at", { mode: "timestamp" })
            .notNull()
            .default(sql`(unixepoch())`),
        modifiedAt: integer("modified_at", { mode: "timestamp" })
    },
    (self) => [primaryKey({ columns: [self.id, self.tripId] })]
);
