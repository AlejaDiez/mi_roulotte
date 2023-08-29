export const setCookie = (
    name: string,
    value: string | number | boolean,
    days: number = 1
) => {
    const expirationDate: Date = new Date();

    expirationDate.setTime(
        expirationDate.getTime() + days * 24 * 60 * 60 * 1000
    );
    document.cookie = `${name}=${encodeURIComponent(
        value
    )};expires=${expirationDate.toUTCString()};path=/`;
};

export const getCookie = (name: string) => {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(";");

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(name + "=") === 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return undefined;
};
