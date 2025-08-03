import { CommentsTable, CommentsTableColumns } from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { PartialCommentPreview } from "./get_comments";

export const getCommentById = defineAction({
    input: z.object({
        id: z.number(),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id, relative_url, fields },
        context
    ): Promise<PartialCommentPreview> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .select(CommentsTableColumns)
            .from(CommentsTable)
            .where(eq(CommentsTable.id, id))
            .get();

        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Comment with id '${id}' not found`
            });
        }

        const repliesData = await db
            .select(CommentsTableColumns)
            .from(CommentsTable)
            .where(eq(CommentsTable.repliedTo, id));

        return filterObject(
            {
                id: data.id,
                username: data.username,
                content: data.content,
                url: relative_url
                    ? composeRelativeUrl(
                          data.tripId,
                          data.stageId,
                          `#comment-${data.id}`
                      )
                    : composeUrl(
                          data.tripId,
                          data.stageId,
                          `#comment-${data.id}`
                      ),
                lastModifiedAt: data.modifiedAt ?? data.createdAt,
                replies: repliesData.map((e) =>
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
                                : composeUrl(
                                      e.tripId,
                                      e.stageId,
                                      `#comment-${e.id}`
                                  ),
                            lastModifiedAt: e.modifiedAt ?? e.createdAt
                        },
                        { fields }
                    )
                )
            },
            { fields }
        );
    }
});
