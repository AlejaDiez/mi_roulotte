import { ActionError } from "astro:actions";

export const headers = (req: Request): Record<string, any> =>
    Object.fromEntries(req.headers.entries());

export const searchParams = (req: Request): Record<string, any> => {
    const url = new URL(req.url);
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
        if (value.trim() === "") {
            return acc;
        }
        return {
            ...acc,
            [key]: cast(value)
        };
    }, {});
};

export const json = async (req: Request): Promise<Record<string, any>> => {
    const { "content-type": contentType } = headers(req);

    if (!contentType?.startsWith("application/json")) {
        throw new ActionError({
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Content-Type must be application/json"
        });
    }

    return await req.json();
};

export const arrayBuffer = async (req: Request): Promise<ArrayBuffer> => {
    return await req.arrayBuffer();
};
