export function formatDateInput(val) {
    if (!val) return "";
    return String(val).slice(0, 10);
}

/**
 * Format a YYYY-MM-DD or ISO date string as "Mar 2024" in UTC
 * so local negative timezone offsets do not shift the month backward.
 */
export function formatMonthYear(val) {
    if (!val) return "Present";
    const str = String(val).trim();
    const ymdMatch = str.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (ymdMatch) {
        const year = Number(ymdMatch[1]);
        const month = Number(ymdMatch[2]) - 1;
        const day = Number(ymdMatch[3] || 1);
        const utcDate = new Date(Date.UTC(year, month, day));
        if (!Number.isNaN(utcDate.getTime())) {
            return utcDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
            });
        }
    }

    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function formatDateTime(iso, fallback = "-") {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDateShort(iso, fallback = "—") {
    if (!iso) return fallback;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatTimeParts(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return {
        date: d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        time: d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }),
    };
}

export function formatShortTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}
