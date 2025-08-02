export const composeRelativeUrl = (...paths: (string | null | undefined)[]) =>
    `/${paths
        .filter((e) => e)
        .map((e) => e!.trim())
        .join("/")}`;

export const composeUrl = (...paths: (string | null | undefined)[]) =>
    `${import.meta.env.SITE}${composeRelativeUrl(...paths)}`;
