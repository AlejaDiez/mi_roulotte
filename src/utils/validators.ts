export const validateNumber = (
    obj: any,
    params?: { min?: number; max?: number }
) => {
    if (typeof obj !== "number" || isNaN(obj)) return false;
    if (params?.min !== undefined && obj < params.min) return false;
    if (params?.max !== undefined && obj > params.max) return false;
    return true;
};

export const validateOptionalNumber = (
    obj: any,
    params?: { min?: number; max?: number }
) => obj === undefined || obj === null || validateNumber(obj, params);

export const validateString = (obj: any) =>
    typeof obj === "string" && obj.trim() !== "";

export const validateOptionalString = (obj: any) =>
    obj === undefined || obj === null || validateString(obj);

export const validateEmail = (str: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
