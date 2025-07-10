import { sql } from "drizzle-orm";
import { integer, sqliteTable as table, text } from "drizzle-orm/sqlite-core";

export default table("trips", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    image: text("image"),
    video: text("video"),
    content: text("content").notNull().default(""),
    keywords: text("keywords", { mode: "json" }),
    published: integer("published", { mode: "boolean" })
        .notNull()
        .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    modifiedAt: integer("modified_at", { mode: "timestamp" }),
});
