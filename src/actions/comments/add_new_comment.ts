import type { PartialComment } from "@models/comment";
import {
    insertComment,
    selectStage,
    selectTrip,
    type DataType
} from "@queries";
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
                .nullable()
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
                .nullable()
                .optional(),
            content: z
                .string({
                    invalid_type_error: "content must be a string",
                    required_error: "content is required"
                })
                .nonempty("content must not be empty")
        }),
        fields: z
            .string({
                invalid_type_error: "fields must be a string"
            })
            .or(
                z.array(z.string(), {
                    invalid_type_error: "fields must be an array of strings"
                })
            )
            .optional()
            .transform((e) => (typeof e === "string" ? [e] : e)),
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
                content: body.content,
                userAgent: ctx.request.headers.get("user-agent"),
                ipAddress: ctx.clientAddress
            },
            {
                fields,
                site: !relative
                    ? (ctx.locals.runtime.env.SITE ?? import.meta.env.SITE)
                    : undefined
            }
        );

        return {
            id: data.id,
            tripId: data.tripId,
            stageId: data.stageId,
            username: data.username,
            content: data.content,
            repliedTo: data.repliedTo,
            replies:
                !fields || fields?.length === 0 || fields?.includes("replies")
                    ? []
                    : undefined,
            url: data.url,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
});
