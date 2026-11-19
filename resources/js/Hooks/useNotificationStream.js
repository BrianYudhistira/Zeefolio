import { useEffect, useRef, useState } from "react";

const DEFAULT_RECONNECT_DELAY_MS = 3000;
const ERROR_RECONNECT_DELAY_MS = 5000;
const MAX_LIVE_NOTIFICATIONS = 15;

function getMaxNotificationId(items = []) {
    return items.reduce((max, item) => Math.max(max, Number(item?.id) || 0), 0);
}

/**
 * Subscribe to the admin SSE notification stream and keep live notifications synced with Inertia props.
 */
export function useNotificationStream({
    userId,
    initialNotifications = [],
    onExternalNotification,
}) {
    const [liveNotifications, setLiveNotifications] = useState(initialNotifications);
    const latestNotifIdRef = useRef(getMaxNotificationId(initialNotifications));
    const onExternalNotificationRef = useRef(onExternalNotification);

    useEffect(() => {
        onExternalNotificationRef.current = onExternalNotification;
    }, [onExternalNotification]);

    useEffect(() => {
        setLiveNotifications(initialNotifications);
        const maxId = getMaxNotificationId(initialNotifications);
        if (maxId > latestNotifIdRef.current) {
            latestNotifIdRef.current = maxId;
        }
    }, [initialNotifications]);

    useEffect(() => {
        if (!userId || typeof EventSource === "undefined") return;

        let eventSource = null;
        let reconnectTimer = null;
        let disposed = false;

        const handleNotificationEvent = (event) => {
            try {
                const incoming = JSON.parse(event.data);
                if (!incoming?.id) return;

                const incomingId = Number(incoming.id) || 0;
                if (incomingId > latestNotifIdRef.current) {
                    latestNotifIdRef.current = incomingId;
                }

                setLiveNotifications((prev) => {
                    if (prev.some((item) => item.id === incoming.id)) {
                        return prev;
                    }
                    return [incoming, ...prev].slice(0, MAX_LIVE_NOTIFICATIONS);
                });

                window.dispatchEvent(
                    new CustomEvent("admin:sse-notification", {
                        detail: incoming,
                    })
                );

                if (Number(incoming.actor_id) !== Number(userId)) {
                    onExternalNotificationRef.current?.(incoming);
                }
            } catch {
                // Ignore malformed SSE frame
            }
        };

        const cleanupStream = () => {
            if (!eventSource) return;
            eventSource.removeEventListener("notification", handleNotificationEvent);
            eventSource.removeEventListener("cycle-end", handleCycleEnd);
            eventSource.close();
            eventSource = null;
        };

        const scheduleReconnect = (delayMs = DEFAULT_RECONNECT_DELAY_MS) => {
            if (disposed || reconnectTimer) return;
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                connect();
            }, delayMs);
        };

        const handleCycleEnd = (event) => {
            let delayMs = DEFAULT_RECONNECT_DELAY_MS;
            try {
                const payload = JSON.parse(event.data);
                if (typeof payload?.reconnect_in_ms === "number") {
                    delayMs = payload.reconnect_in_ms;
                }
            } catch {
                // Use default delay
            }

            cleanupStream();
            scheduleReconnect(delayMs);
        };

        const connect = () => {
            if (disposed) return;

            const streamUrl = route("admin.notifications.stream", {
                last_id: latestNotifIdRef.current,
            });
            eventSource = new EventSource(streamUrl);
            eventSource.addEventListener("notification", handleNotificationEvent);
            eventSource.addEventListener("cycle-end", handleCycleEnd);
            eventSource.onerror = () => {
                cleanupStream();
                scheduleReconnect(ERROR_RECONNECT_DELAY_MS);
            };
        };

        connect();

        return () => {
            disposed = true;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
            cleanupStream();
        };
    }, [userId]);

    return liveNotifications;
}
