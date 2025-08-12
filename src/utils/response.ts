import { ActionInputError, type ActionError } from "astro:actions";

export const getErrorObject = (error: ActionError) => ({
    error: error.code,
    code: error.status,
    message:
        error instanceof ActionInputError
            ? [...Object.values(error.fields)].flat()
            : error.message
});
