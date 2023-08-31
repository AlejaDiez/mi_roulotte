export const capitalizeString = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

export const getTravelSubtitle = (str: string, date: Date): string =>
    `${str} ${date.getFullYear()}`;
