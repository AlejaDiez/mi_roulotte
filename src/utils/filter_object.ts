export const filterObject = <T extends object>(
    obj: T,
    {
        fields,
        required = [],
        depth
    }: {
        fields?: string[];
        required?: (keyof T)[];
        depth?: string;
    }
): Partial<T> => {
    if (!fields || fields.length === 0) {
        return { ...obj };
    }

    const result: Partial<T> = {};
    const requiredSet = new Set(required);
    const filteredFields = depth
        ? fields
              .filter((f) => f.startsWith(`${depth}.`))
              .map((f) => f.slice(depth.length + 1))
        : fields;

    if (
        depth &&
        filteredFields.length === 0 &&
        fields.some((f) => f.includes(depth))
    ) {
        return { ...obj };
    }

    for (const key of requiredSet) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    for (const field of filteredFields) {
        const key = field.split(".")[0] as keyof T;

        if (!requiredSet.has(key) && key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
};
