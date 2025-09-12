import type { Pagination } from "@interfaces/pagination";

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
