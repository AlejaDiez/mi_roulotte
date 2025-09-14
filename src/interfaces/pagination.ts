export interface Pagination<T extends object> {
    page: number;
    totalPages: number;
    items: number;
    totalItems: number;
    data: T[];
}
