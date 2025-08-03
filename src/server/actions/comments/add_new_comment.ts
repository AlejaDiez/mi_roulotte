import {
    CommentsTable,
    StagesTable,
    StagesTableColumns,
    TripsTable,
    TripsTableColumns
} from "@schemas";
import { composeRelativeUrl, composeUrl } from "@utils/compose_url";
import { filterObject } from "@utils/filter_object";
import {
    validateEmail,
    validateOptionalString,
    validateString
} from "@utils/validators";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { PartialCommentPreview } from "./get_comments";

export const addNewComment = defineAction({
    input: z.object({
        body: z.record(z.any()),
        relative_url: z.boolean().default(false),
        fields: z
            .string()
            .optional()
            .transform((e) => e?.split(","))
    }),
    handler: async (
        { body, relative_url, fields },
        context
    ): Promise<PartialCommentPreview> => {
        const db = drizzle(context.locals.runtime.env.DB);
        const errors = [];

        // Validate body
        if (!validateString(body["tripId"])) {
            errors.push("'trip-id' is missing or invalid");
        }
        if (!validateOptionalString(body["stageId"])) {
            errors.push("'stage-id' is invalid");
        }
        if (!validateString(body["username"])) {
            errors.push("'username' is missing or invalid");
        }
        if (
            !validateOptionalString(body["email"]) ||
            (validateString(body["email"]) && !validateEmail(body["email"]))
        ) {
            errors.push("'email' is invalid");
        }
        if (!validateString(body["content"])) {
            errors.push("'content' is missing or invalid");
        }
        if (errors.length > 0) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: `Validation failed: ${errors.join("; ")}`
            });
        }

        // Check if is possible to add a comment
        const allowComments = (
            body["stageId"]
                ? await db
                      .select({
                          allowComments: StagesTableColumns.allowComments
                      })
                      .from(StagesTable)
                      .where(
                          and(
                              eq(StagesTable.id, body["stageId"]),
                              eq(StagesTable.tripId, body["tripId"])
                          )
                      )
                      .get()
                : await db
                      .select({
                          allowComments: TripsTableColumns.allowComments
                      })
                      .from(TripsTable)
                      .where(eq(TripsTable.id, body["tripId"]))
                      .get()
        )?.allowComments;

        if (allowComments === undefined) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: body["stageId"]
                    ? `Stage with id '${body["stageId"]}' and trip id '${body["tripId"]}' does not exist`
                    : `Trip with id '${body["tripId"]}' does not exist`
            });
        } else if (!allowComments) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: body["stageId"]
                    ? `Stage does not allow comments`
                    : `Trip does not allow comments`
            });
        }

        // Get data
        const data = await db
            .insert(CommentsTable)
            .values({
                tripId: body["tripId"],
                stageId: body["stageId"],
                username: body["username"],
                email: body["email"],
                content: body["content"]
            })
            .returning()
            .get();

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
                replies: []
            },
            { fields }
        );
    }
});
