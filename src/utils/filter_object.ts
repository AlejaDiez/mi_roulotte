import { z } from "astro:schema";
import { sql } from "drizzle-orm";

export const fields = z
    .string({
        invalid_type_error: "fields must be a string"
    })
    .or(
        z.array(z.string(), {
            invalid_type_error: "fields must be an array of strings"
        })
    )
    .optional()
    .transform((e) => (typeof e === "string" ? [e] : e));

export const filterObject = <T extends object>(
    columns: T,
    fields: string[] | undefined
) => {
    if (!fields || fields.length === 0) {
        return columns;
    }

    const set = new Set(fields);
    const cols = Object.entries(columns).reduce((acc, [key, value]) => {
        if (key.startsWith("_") || set.has(key)) {
            return { ...acc, [key]: value };
        }
        return acc;
    }, {});

    if (Object.keys(cols).length === 0) {
        return { _: sql`1` };
    }
    return cols;
};

export const canFilter = (field: string, fields: string[] | undefined) =>
    fields?.some((e) => e.includes(field)) ?? true;

export const subFields = (field: string, fields: string[] | undefined) =>
    fields
        ?.filter((e) => e.includes(`${field}.`))
        .map((e) => e.replace(`${field}.`, "")) ?? [];
