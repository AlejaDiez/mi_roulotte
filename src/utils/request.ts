export const getQueryParams = (request: Request): any =>
    Object.fromEntries(new URL(request.url).searchParams.entries());

export const getBody = async (request: Request): Promise<Record<string, any>> =>
    await request.json();
