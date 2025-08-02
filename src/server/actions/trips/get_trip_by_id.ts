import { type PartialCommentPreview, type PartialStagePreview } from "@actions";
import { buildRelatedComments } from "@models/comment";
import type { Trip } from "@models/trip";
import {
    CommentsTable,
    CommentsTableColumns,
    StagesTable,
    StagesTableColumns,
    TripsTable,
    TripsTableColumns
} from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type PartialTrip = Partial<
    Omit<Omit<Trip, "stages">, "comments"> & {
        stages: PartialStagePreview[];
        comments: PartialCommentPreview[] | null;
    }
>;

export const getTripById = defineAction({
    input: z.object({
        id: z.string().default(""),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { id, relative_url, fields },
        context
    ): Promise<PartialTrip> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const data = await db
            .select(TripsTableColumns)
            .from(TripsTable)
            .where(and(eq(TripsTable.id, id), eq(TripsTable.published, true)))
            .get();

        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${id}' not found`
            });
        }

        let stagesData: PartialStagePreview[] | undefined = undefined;

        if (!fields || fields.some((f) => f.includes("stages"))) {
            const data = await db
                .select(StagesTableColumns)
                .from(StagesTable)
                .where(
                    and(
                        eq(StagesTable.tripId, id),
                        eq(StagesTable.published, true)
                    )
                )
                .orderBy(StagesTable.date);

            stagesData = data.map<PartialStagePreview>((e) =>
                filterObject(
                    {
                        name: e.name,
                        date: e.date,
                        title: e.title,
                        description: e.description,
                        image: e.image,
                        url: relative_url
                            ? composeRelativeUrl(id, e.id)
                            : composeUrl(id, e.id)
                    },
                    { fields, depth: "stages" }
                )
            );
        }

        let commentsData: PartialCommentPreview[] | undefined = undefined;

        if (
            data.allowComments &&
            (!fields || fields.some((f) => f.includes("comments")))
        ) {
            const data = await db
                .select(CommentsTableColumns)
                .from(CommentsTable)
                .innerJoin(
                    TripsTable,
                    and(
                        eq(CommentsTable.tripId, TripsTable.id),
                        eq(TripsTable.allowComments, true)
                    )
                )
                .where(eq(CommentsTable.tripId, id))
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
                            ? composeRelativeUrl(id, `#comment-${e.id}`)
                            : composeUrl(id, `#comment-${e.id}`),
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
                name: data.name,
                date: data.date,
                title: data.title,
                description: data.description,
                image: data.image,
                video: data.video,
                content: data.content as object[],
                stages: stagesData,
                keywords: data.keywords as string[] | null,
                published: data.published,
                allowComments: data.allowComments,
                comments: commentsData,
                url: relative_url ? composeRelativeUrl(id) : composeUrl(id),
                createdAt: data.createdAt,
                modifiedAt: data.modifiedAt
            },
            { fields }
        );
    }
});
