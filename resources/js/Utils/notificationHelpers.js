import { router } from "@inertiajs/react";

export const NOTIFICATION_TONE_STYLES = {
    delete: "text-red-400",
    add: "text-emerald-400",
    default: "text-[var(--text-muted)]",
};

export function getNotificationTone(message = "") {
    const normalized = String(message).toLowerCase();

    if (normalized.includes("deleted") || normalized.includes("removed")) {
        return "delete";
    }

    if (
        normalized.includes("added") ||
        normalized.includes("created") ||
        normalized.includes("promoted")
    ) {
        return "add";
    }

    return "default";
}

export function navigateNotification(item, onBeforeNavigate) {
    if (!item) return;

    const isRead = Boolean(item.is_read || item.read_at);
    const targetUrl = item.action_url;

    const finishNavigation = () => {
        onBeforeNavigate?.();
        if (targetUrl) {
            router.visit(targetUrl);
        }
    };

    if (!isRead) {
        router.put(
            route("admin.notifications.read", item.id),
            {},
            {
                preserveScroll: true,
                onFinish: finishNavigation,
            }
        );
        return;
    }

    finishNavigation();
}
