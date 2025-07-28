export const filterObject = <T extends object>(
    obj: T,
    fields?: string[],
    requiredFields: (keyof T)[] = []
): Partial<T> => {
    const requiredSet = new Set(requiredFields);

    if (!fields || fields.length === 0) {
        return { ...obj };
    }

    const result: Partial<T> = {};

    for (const key of requiredSet) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    for (const key of fields) {
        if (key in obj && !requiredSet.has(key as keyof T)) {
            result[key as keyof T] = obj[key as keyof T];
        }
    }
    return result;
};
