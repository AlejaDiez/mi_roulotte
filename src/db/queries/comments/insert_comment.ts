import { CommentsTable } from "@schemas";
import { filterObjectColumns } from "@utils/filter_object";
import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const insertComment = (
    db: DrizzleD1Database,
    value: {
        tripId: string;
        stageId?: string | null;
        username: string;
        email?: string | null;
        content: string;
        repliedTo?: string | null;
        userAgent?: string | null;
        ipAddress?: string | null;
    },
    config?: {
        fields?: string[];
        site?: string;
    }
) => {
    const columns = {
        id: CommentsTable.id,
        tripId: CommentsTable.tripId,
        stageId: CommentsTable.stageId,
        username: CommentsTable.username,
        email: CommentsTable.email,
        content: CommentsTable.content,
        url: sql`
            CASE 
                WHEN ${CommentsTable.stageId} IS NULL THEN 
                    CONCAT(${config?.site ?? ""}, '/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                ELSE 
                    CONCAT(${config?.site ?? ""}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
            END`,
        repliedTo: CommentsTable.repliedTo,
        userAgent: CommentsTable.userAgent,
        ipAddress: CommentsTable.ipAddress,
        createdAt: CommentsTable.createdAt,
        updatedAt: CommentsTable.updatedAt
    };
    const query = db
        .insert(CommentsTable)
        .values({
            tripId: value.tripId,
            stageId: value.stageId,
            username: value.username,
            email: value.email,
            content: value.content,
            repliedTo: value.repliedTo,
            userAgent: value.userAgent,
            ipAddress: value.ipAddress
        })
        .returning(filterObjectColumns(columns, config?.fields))
        .get();

    return query;
};
