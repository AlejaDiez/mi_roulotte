import { buildRelatedComments, type CommentPreview } from "@models/comment";
import { CommentsTable, CommentsTableColumns } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type PartialCommentPreview = Partial<
    Omit<CommentPreview, "replies"> & {
        replies: Partial<CommentPreview>[];
    }
>;

export const getComments = defineAction({
    input: z.object({
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { relative_url, fields },
        context
    ): Promise<PartialCommentPreview[]> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .select(CommentsTableColumns)
            .from(CommentsTable)
            .orderBy(
                sql`COALESCE(${CommentsTable.modifiedAt}, ${CommentsTable.createdAt}) DESC`
            );

        return buildRelatedComments(data, (e) =>
            filterObject(
                {
                    id: e.id,
                    username: e.username,
                    content: e.content,
                    url: relative_url
                        ? composeRelativeUrl(
                              e.tripId,
                              e.stageId,
                              `#comment-${e.id}`
                          )
                        : composeUrl(e.tripId, e.stageId, `#comment-${e.id}`),
                    lastModifiedAt: e.modifiedAt ?? e.createdAt,
                    replies: e.replies
                },
                { fields }
            )
        );
    }
});
