import { z } from "astro:schema";

export const page = z
    .number({
        invalid_type_error: "page must be a number"
    })
    .int("page must be an integer number")
    .positive("page must be a positive number");
export const limit = z
    .number({
        invalid_type_error: "limit must be a number"
    })
    .int("limit must be an integer number")
    .positive("limit must be a positive number");

export interface Pagination<T extends object> {
    page: number;
    totalPages: number;
    items: number;
    totalItems: number;
    data: T[];
}

export const paginateObject = async <T extends object>(
    obj: T[],
    page: number | undefined,
    limit: number | undefined,
    count: () => Promise<number>
): Promise<T[] | Pagination<T>> => {
    if (page && limit && count) {
        const num = await count();

        return {
            page: page,
            totalPages: Math.ceil(num / limit),
            items: obj.length,
            totalItems: num,
            data: obj
        };
    }
    return obj;
};
