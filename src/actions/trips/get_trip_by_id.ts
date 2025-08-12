import { buildRelatedComments } from "@models/comment";
import type { PartialTrip } from "@models/trip";
import {
    selectComments,
    selectStages,
    selectTrip,
    type DataType,
    type ListDataType
} from "@queries";
import { canFilter, fields, subFields } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getTripById = defineAction({
    input: z.object({
        tripId: z
            .string({
                invalid_type_error: "tripId must be a string",
                required_error: "tripId is required"
            })
            .nonempty("tripId must not be empty"),
        fields,
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialTrip> => {
        const { tripId, fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);
        const data: DataType = await selectTrip(db, tripId, {
            fields,
            relative
        });

        // Trip exists???
        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${tripId}' not found`
            });
        }

        // Get stages
        let stagesData: ListDataType | undefined;

        if (canFilter("stages", fields)) {
            const subfields = subFields("stages", fields);

            stagesData = await selectStages(db, tripId, {
                fields: subfields,
                relative
            }).then((e) => e.map(({ _, ...e }: any) => e));
        }

        // Get comments
        let commentsData: ListDataType | undefined;

        if (data._allowComments && canFilter("comments", fields)) {
            const subfields = subFields("comments", fields);

            commentsData = await selectComments(db, tripId, null, {
                fields: subfields,
                relative
            }).then((e) =>
                buildRelatedComments(
                    e,
                    subfields.length === 0 || subfields.includes("replies")
                )
            );
        }

        // Sort properties
        return {
            id: data.id,
            name: data.name,
            date: data.date,
            title: data.title,
            description: data.description,
            image: data.image,
            video: data.video,
            content: data.content,
            stages: stagesData,
            keywords: data.keywords,
            published: data.published,
            allowComments: data.allowComments,
            comments: commentsData,
            url: data.url,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt
        };
    }
});
