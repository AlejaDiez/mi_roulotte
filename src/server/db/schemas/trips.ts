import { sql } from "drizzle-orm";
import { integer, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export const TripsTable = table("trips", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    image: text("image"),
    video: text("video"),
    content: text("content", { mode: "json" }).notNull().default("[]"),
    keywords: text("keywords", { mode: "json" }),
    published: integer("published", { mode: "boolean" })
        .notNull()
        .default(false),
    allowComments: integer("allow_comments", { mode: "boolean" })
        .notNull()
        .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    modifiedAt: integer("modified_at", { mode: "timestamp" })
});

export const TripsTableColumns = {
    id: TripsTable.id,
    name: TripsTable.name,
    date: TripsTable.date,
    title: TripsTable.title,
    description: TripsTable.description,
    image: TripsTable.image,
    video: TripsTable.video,
    content: TripsTable.content,
    keywords: TripsTable.keywords,
    published: TripsTable.published,
    allowComments: TripsTable.allowComments,
    createdAt: TripsTable.createdAt,
    modifiedAt: TripsTable.modifiedAt
};
