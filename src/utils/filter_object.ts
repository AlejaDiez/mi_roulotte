import { sql } from "drizzle-orm";

export const filterObject = <T extends object>(
    obj: T,
    fields: string[] | undefined
): Partial<T> => {
    if (!fields || fields.length === 0) {
        return { ...obj };
    }

    const result: Partial<T> = {};

    for (const key of fields) {
        if (key in obj) {
            result[key as keyof T] = obj[key as keyof T];
        }
    }
    return result;
};

export const filterObjectColumns = <T extends object>(
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
        return { _: sql`'_'` };
    }
    return cols;
};

export const canFilter = (field: string, fields: string[] | undefined) =>
    fields?.some((e) => e.includes(field)) ?? true;

export const subFields = (field: string, fields: string[] | undefined) =>
    fields
        ?.filter((e) => e.includes(`${field}.`))
        .map((e) => e.replace(`${field}.`, "")) ?? [];
