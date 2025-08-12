import { buildRelatedComments } from "@models/comment";
import type { PartialStage } from "@models/stage";
import {
    selectComments,
    selectStage,
    tripExists,
    type DataType,
    type ListDataType
} from "@queries";
import { canFilter, fields, subFields } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const getStageById = defineAction({
    input: z.object({
        tripId: z
            .string({
                invalid_type_error: "tripId must be a string",
                required_error: "tripId is required"
            })
            .nonempty("tripId must not be empty"),
        stageId: z
            .string({
                invalid_type_error: "stageId must be a string",
                required_error: "stageId is required"
            })
            .nonempty("stageId must not be empty"),
        fields,
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialStage> => {
        const { tripId, stageId, fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Trip exists???
        if (!(await tripExists(db, tripId))) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Trip with id '${tripId}' not found`
            });
        }

        const data: DataType = await selectStage(db, tripId, stageId, {
            fields
        });

        // Stage exists???
        if (!data) {
            throw new ActionError({
                code: "NOT_FOUND",
                message: `Stage with id '${stageId}' not found in trip with id '${tripId}'`
            });
        }

        // Get comments
        let commentsData: ListDataType | undefined;

        if (data._allowComments && canFilter("comments", fields)) {
            const subfields = subFields("comments", fields);

            commentsData = await selectComments(db, tripId, stageId, {
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
            content: data.content,
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
