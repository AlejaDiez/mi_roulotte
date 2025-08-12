export const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

    const seconds = Math.round(diff / 1000);
    if (seconds < 60) {
        return rtf.format(-seconds, "second");
    }

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return rtf.format(-minutes, "minute");
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return rtf.format(-hours, "hour");
    }

    const days = Math.round(hours / 24);
    if (days < 30) {
        return rtf.format(-days, "day");
    }

    const months = Math.round(days / 30);
    if (months < 12) {
        return rtf.format(-months, "month");
    }

    const years = Math.round(days / 365);
    return rtf.format(-years, "year");
};
