import { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    HiOutlineBell,
    HiOutlineTrash,
    HiOutlinePlusCircle,
    HiOutlineCheckCircle,
    HiXMark,
    HiBars3,
} from "react-icons/hi2";

export default function TopBar({
    title = "Dashboard",
    headerActions = null,
    notifications = [],
    onOpenSidebar,
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const unreadCount = notifications.filter(
        (item) => !item.is_read && !item.read_at
    ).length;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllAsRead = () => {
        router.put(
            route("admin.notifications.read-all"),
            {},
            {
                preserveScroll: true,
                showProgress: false
            }
        );
    };

    const handleDismissFromPopup = (e, notificationId) => {
        e.stopPropagation();
        router.put(
            route("admin.notifications.popup-dismiss", notificationId),
            {},
            { preserveScroll: true }
        );
    };

    const handleClearPopup = () => {
        router.put(
            route("admin.notifications.popup-clear"),
            {},
            {
                preserveScroll: true,
                showProgress: false
            }
        );
    };

    const handleNotificationClick = (item) => {
        const isRead = Boolean(item.is_read || item.read_at);
        const targetUrl = item.action_url;

        if (!isRead) {
            router.put(
                route("admin.notifications.read", item.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setNotifOpen(false);
                        if (targetUrl) {
                            router.visit(targetUrl);
                        }
                    },
                }
            );
            return;
        }

        setNotifOpen(false);
        if (targetUrl) {
            router.visit(targetUrl);
        }
    };

    return (
        <header className="sticky top-0 z-20 h-14 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                    aria-label="Open Sidebar"
                >
                    <HiBars3 className="w-5 h-5" />
                </button>

                <h1 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                {headerActions}

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        type="button"
                        onClick={() => setNotifOpen((prev) => !prev)}
                        className="relative p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                        title="Notifications"
                    >
                        <HiOutlineBell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center leading-none">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-zinc-100">
                                    Notifications
                                </span>

                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllAsRead}
                                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                        >
                                            <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearPopup}
                                            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {notifications.length === 0 ? (
                                <p className="text-xs text-zinc-500 py-8 text-center">
                                    No new notifications.
                                </p>
                            ) : (
                                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/70">
                                    {notifications.map((item) => {
                                        const isRead = Boolean(
                                            item.is_read || item.read_at
                                        );
                                        const msg = item.message || "";
                                        const isDelete =
                                            msg
                                                .toLowerCase()
                                                .includes("deleted") ||
                                            msg
                                                .toLowerCase()
                                                .includes("removed");
                                        const isAdd =
                                            msg
                                                .toLowerCase()
                                                .includes("added") ||
                                            msg
                                                .toLowerCase()
                                                .includes("created") ||
                                            msg
                                                .toLowerCase()
                                                .includes("promoted");

                                        return (
                                            <div
                                                key={item.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        item
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.preventDefault();
                                                        handleNotificationClick(
                                                            item
                                                        );
                                                    }
                                                }}
                                                className={`px-4 py-3 transition-colors flex items-start gap-3 cursor-pointer ${isRead
                                                    ? "bg-transparent opacity-60 hover:bg-zinc-800/30 hover:opacity-90"
                                                    : "bg-zinc-800/60 hover:bg-zinc-800/85"
                                                    }`}
                                            >
                                                <div
                                                    className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${isDelete
                                                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                        : isAdd
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                            : "bg-zinc-800 border-zinc-700 text-zinc-300"
                                                        }`}
                                                >
                                                    {isDelete ? (
                                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <HiOutlinePlusCircle className="w-3.5 h-3.5" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={`text-xs leading-snug ${isRead
                                                            ? "text-zinc-300"
                                                            : "text-zinc-100 font-medium"
                                                            }`}
                                                    >
                                                        {item.message}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500 truncate">
                                                        {item.module && (
                                                            <span>
                                                                {item.module}
                                                            </span>
                                                        )}
                                                        <span>•</span>
                                                        <span className="truncate">
                                                            {item.user?.name ||
                                                                "System"}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {item.created_at
                                                                ? new Date(
                                                                    item.created_at
                                                                ).toLocaleTimeString(
                                                                    [],
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleDismissFromPopup(
                                                            e,
                                                            item.id
                                                        )
                                                    }
                                                    title="Hide from popup"
                                                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60 transition-colors shrink-0 cursor-pointer"
                                                >
                                                    <HiXMark className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/50 text-center">
                                <Link
                                    href={route("admin.notifications.index")}
                                    onClick={() => setNotifOpen(false)}
                                    className="text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
