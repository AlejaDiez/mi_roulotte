export const getQueryParams = (request: Request): any =>
    Object.fromEntries(new URL(request.url).searchParams.entries());
