import type { PartialComment } from "@models/comment";
import {
    insertComment,
    selectStage,
    selectTrip,
    type DataType
} from "@queries";
import { fields } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { drizzle } from "drizzle-orm/d1";

export const addNewComment = defineAction({
    input: z.object({
        body: z.object({
            tripId: z
                .string({
                    invalid_type_error: "tripId must be a string",
                    required_error: "tripId is required"
                })
                .nonempty("tripId must not be empty"),
            stageId: z
                .string({
                    invalid_type_error: "stageId must be a string or undefined"
                })
                .nonempty("stageId must not be empty")
                .optional(),
            username: z
                .string({
                    invalid_type_error: "username must be a string",
                    required_error: "username is required"
                })
                .nonempty("username must not be empty"),
            email: z
                .string({
                    invalid_type_error: "email must be a string or undefined"
                })
                .email("email must be a valid email address")
                .optional(),
            content: z
                .string({
                    invalid_type_error: "content must be a string",
                    required_error: "content is required"
                })
                .nonempty("content must not be empty")
        }),
        fields,
        relative: z.boolean().default(false)
    }),
    handler: async (input, ctx): Promise<PartialComment> => {
        const { body, fields, relative } = input;
        const db = drizzle(ctx.locals.runtime.env.DB);

        // Check if is possible to add a comment
        const { allowComments } = ((await (body.stageId
            ? selectStage(db, body.tripId, body.stageId, {
                  fields: ["allowComments"]
              })
            : selectTrip(db, body.tripId, {
                  fields: ["allowComments"]
              }))) ?? {}) as any;

        if (allowComments === undefined) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: body.stageId
                    ? `Stage with id '${body.stageId}' and trip id '${body.tripId}' does not exist`
                    : `Trip with id '${body.tripId}' does not exist`
            });
        } else if (!allowComments) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: body.stageId
                    ? `Stage does not allow comments`
                    : `Trip does not allow comments`
            });
        }

        // Insert the comment
        const data: DataType = await insertComment(
            db,
            {
                tripId: body.tripId,
                stageId: body.stageId,
                username: body.username,
                email: body.email,
                content: body.content
            },
            {
                fields,
                relative
            }
        );

        return {
            id: data.id,
            tripId: data.tripId,
            stageId: data.stageId,
            username: data.username,
            repliedTo: data.repliedTo,
            url: data.url,
            replies:
                !fields || fields?.length === 0 || fields?.includes("replies")
                    ? []
                    : undefined,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt
        };
    }
});
