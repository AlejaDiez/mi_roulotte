import { buildRelatedComments } from "@models/comment";
import type { Stage } from "@models/stage";
import {
    CommentsTable,
    CommentsTableColumns,
    StagesTable,
    StagesTableColumns,
    TripsTable
} from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { PartialCommentPreview } from "../comments/get_comments";

export type PartialStage = Partial<
    Omit<Stage, "comments"> & {
        comments?: PartialCommentPreview[];
    }
>;

export const getStageById = defineAction({
    input: z.object({
        id: z.tuple([z.string().default(""), z.string().default("")]),
        check_travel: z.boolean().default(true),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id: [tripId, stageId], check_travel, relative_url, fields },
        context
    ): Promise<PartialStage> => {
        const db = drizzle(context.locals.runtime.env.DB);

        if (check_travel) {
            const exists = !!(await db
                .select({ id: TripsTable.id })
                .from(TripsTable)
                .where(eq(TripsTable.id, tripId))
                .get());

            if (!exists) {
                throw new ActionError({
                    code: "NOT_FOUND",
                    message: `Trip with id '${tripId}' does not exist`
                });
            }
        }

        const data = await db
            .select(StagesTableColumns)
            .from(StagesTable)
            .where(
                and(
                    eq(StagesTable.tripId, tripId),
                    eq(StagesTable.id, stageId),
                    eq(StagesTable.published, true)
                )
            )
            .get();

        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Stage with id '${stageId}' not found`
            });
        }

        let commentsData: PartialCommentPreview[] | undefined = undefined;

        if (
            data.allowComments &&
            (!fields || fields.some((f) => f.includes("comments")))
        ) {
            const data = await db
                .select(CommentsTableColumns)
                .from(CommentsTable)
                .where(
                    and(
                        eq(CommentsTable.tripId, tripId),
                        eq(CommentsTable.stageId, stageId)
                    )
                )
                .orderBy(
                    sql`COALESCE(${CommentsTable.modifiedAt}, ${CommentsTable.createdAt}) DESC`
                );

            commentsData = buildRelatedComments(data, (e) =>
                filterObject(
                    {
                        id: e.id,
                        username: e.username,
                        content: e.content,
                        url: relative_url
                            ? composeRelativeUrl(
                                  tripId,
                                  stageId,
                                  `#comment-${e.id}`
                              )
                            : composeUrl(tripId, stageId, `#comment-${e.id}`),
                        lastModifiedAt: e.modifiedAt ?? e.createdAt,
                        replies: e.replies
                    },
                    { fields, depth: "comments" }
                )
            );
        }

        return filterObject(
            {
                id: data.id,
                tripId: data.tripId,
                name: data.name,
                date: data.date,
                title: data.title,
                description: data.description,
                image: data.image,
                content: data.content as object[],
                keywords: data.keywords as string[] | null,
                published: data.published,
                allowComments: data.allowComments,
                comments: commentsData,
                url: relative_url
                    ? composeRelativeUrl(tripId, stageId)
                    : composeUrl(tripId, stageId),
                createdAt: data.createdAt,
                modifiedAt: data.modifiedAt
            },
            { fields }
        );
    }
});
