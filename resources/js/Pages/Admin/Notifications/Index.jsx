import { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import EmptyState from "@/Components/UI/EmptyState";
import PaginationBar from "@/Components/UI/PaginationBar";
import {
    NOTIFICATION_TONE_STYLES,
    getNotificationTone,
    navigateNotification,
} from "@/Utils/notificationHelpers";
import {
    HiOutlinePlusCircle,
    HiOutlineTrash,
} from "react-icons/hi2";

export default function NotificationsIndex({
    notificationsList = {},
    stats = {},
    filter = "all",
}) {
    const rows = Array.isArray(notificationsList?.data)
        ? notificationsList.data
        : [];
    const paginationLinks = Array.isArray(notificationsList?.links)
        ? notificationsList.links
        : [];

    useEffect(() => {
        const handleIncomingNotification = () => {
            router.reload({
                only: ["notificationsList", "stats"],
                preserveState: true,
                preserveScroll: true,
                showProgress: false,
            });
        };

        window.addEventListener("admin:sse-notification", handleIncomingNotification);
        return () =>
            window.removeEventListener(
                "admin:sse-notification",
                handleIncomingNotification
            );
    }, []);

    const handleFilterChange = (nextFilter) => {
        const query = nextFilter === "all" ? {} : { filter: nextFilter };
        router.get(route("admin.notifications.index"), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDeleteAll = () => {
        router.delete(route("admin.notifications.clear"), {
            preserveScroll: true,
        });
    };

    const handleDeleteOne = (e, id) => {
        e.stopPropagation();
        router.delete(route("admin.notifications.destroy", id), {
            preserveScroll: true,
        });
    };

    const handleNotificationClick = (item) => {
        navigateNotification(item);
    };

    const formatDateTime = (iso) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const headerActions = (
        <div className="flex items-center gap-2">
            {(stats.total ?? 0) > 0 && (
                <button
                    type="button"
                    onClick={handleDeleteAll}
                    className="admin-btn-danger inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete all</span>
                </button>
            )}
        </div>
    );

    return (
        <AdminLayout title="Notifications" headerActions={headerActions}>
            <Head title="Notifications - Zeefolio" />

            <div className="space-y-5">
                {/* Filter Tabs */}
                <div className="admin-pill-track inline-flex items-center gap-1 p-1 rounded-lg border">
                    {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "read", label: "Read" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleFilterChange(tab.key)}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${filter === tab.key
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="admin-card rounded-xl border overflow-hidden">
                    {rows.length === 0 ? (
                        <div className="p-6">
                            <EmptyState message="You have no notifications in this view." />
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {rows.map((item) => {
                                const isRead = Boolean(
                                    item.is_read || item.read_at
                                );
                                const tone = getNotificationTone(item.message);
                                const Icon =
                                    tone === "delete"
                                        ? HiOutlineTrash
                                        : HiOutlinePlusCircle;

                                return (
                                    <div
                                        key={item.id}
                                        role="button"
                                        tabIndex={0}
                                        data-unread={!isRead ? "true" : "false"}
                                        onClick={() =>
                                            handleNotificationClick(item)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                handleNotificationClick(item);
                                            }
                                        }}
                                        className="admin-notif-item px-4 sm:px-5 py-3.5 flex items-start gap-3 cursor-pointer"
                                    >
                                        <Icon
                                            className={`w-4 h-4 mt-0.5 shrink-0 ${NOTIFICATION_TONE_STYLES[tone]}`}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                {!isRead && (
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] shrink-0"
                                                        aria-label="Unread"
                                                    />
                                                )}
                                                <p
                                                    className={`text-xs sm:text-sm leading-snug ${isRead
                                                        ? "text-[var(--text-muted)]"
                                                        : "text-[var(--text)] font-medium"
                                                        }`}
                                                >
                                                    {item.message}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-[var(--text-muted)]">
                                                {item.module && (
                                                    <span className="admin-notif-module-pill px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                        {item.module}
                                                    </span>
                                                )}
                                                <span>
                                                    {item.user?.name ||
                                                        "System"}
                                                </span>
                                                <span>•</span>
                                                <span className="font-mono">
                                                    {formatDateTime(
                                                        item.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleDeleteOne(e, item.id)
                                            }
                                            title="Delete notification"
                                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] transition-colors shrink-0 cursor-pointer"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <PaginationBar links={paginationLinks} />
                </div>
            </div>
        </AdminLayout>
    );
}
