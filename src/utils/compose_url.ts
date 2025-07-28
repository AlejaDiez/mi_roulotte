export const composeRelativeUrl = (...paths: string[]) =>
    `/${paths.map((e) => e.trim()).join("/")}`;

export const composeUrl = (...paths: string[]) =>
    `${import.meta.env.SITE}${composeRelativeUrl(...paths)}`;
