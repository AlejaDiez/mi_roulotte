export const getHeaders = (request: Request): Record<string, any> =>
    Object.fromEntries(request.headers.entries());

export const getQueryParams = (request: Request): Record<string, any> => {
    const url = new URL(request.url);
    const params = url.searchParams.entries();

    const cast = (val: any) => {
        val = val.trim();

        // Array
        const array = val.split(",");

        if (array.length > 1) {
            return array.map(cast);
        }

        // Boolean
        const bool = val.toLowerCase();

        if (bool === "true") {
            return true;
        } else if (bool === "false") {
            return false;
        }

        // Number
        const num = Number(val);

        if (!isNaN(num) && val !== "") {
            return num;
        }

        // String
        return val;
    };

    return params.reduce((acc, [key, value]) => {
        // Not valid param
        if (value.trim() === "") {
            return acc;
        }

        // Cast
        return {
            ...acc,
            [key]: cast(value)
        };
    }, {});
};

export const getBody = async (request: Request): Promise<Record<string, any>> =>
    await request.json();
