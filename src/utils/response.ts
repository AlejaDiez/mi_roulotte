import type { ErrorInferenceObject } from "astro/actions/runtime/utils.js";
import { type SafeResult } from "astro:actions";

export const response = <TInput extends ErrorInferenceObject, TOutput>(
    { data, error }: SafeResult<TInput, TOutput>,
    status?: number,
    headers?: HeadersInit
): Response => {
    if (error) {
        throw error;
    } else if (data !== undefined) {
        return new Response(JSON.stringify(data), {
            status,
            headers: headers ?? { "Content-Type": "application/json" }
        });
    } else {
        return new Response(null, { status, headers });
    }
};
