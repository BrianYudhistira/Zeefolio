import { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import EmptyState from "@/Components/UI/EmptyState";
import PaginationBar from "@/Components/UI/PaginationBar";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import { formatDateTime } from "@/Utils/dateHelpers";
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
    const [clearModalOpen, setClearModalOpen] = useState(false);
    const [clearingAll, setClearingAll] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const reloadTimerRef = useRef(null);

    const rows = Array.isArray(notificationsList?.data)
        ? notificationsList.data
        : [];
    const paginationLinks = Array.isArray(notificationsList?.links)
        ? notificationsList.links
        : [];

    useEffect(() => {
        const handleIncomingNotification = () => {
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }
            reloadTimerRef.current = setTimeout(() => {
                router.reload({
                    only: ["notificationsList", "stats"],
                    preserveState: true,
                    preserveScroll: true,
                    showProgress: false,
                });
            }, 400);
        };

        window.addEventListener("admin:sse-notification", handleIncomingNotification);
        return () => {
            window.removeEventListener(
                "admin:sse-notification",
                handleIncomingNotification
            );
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }
        };
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
        setClearModalOpen(true);
    };

    const confirmDeleteAll = () => {
        setClearingAll(true);
        router.delete(route("admin.notifications.clear"), {
            preserveScroll: true,
            onSuccess: () => setClearModalOpen(false),
            onFinish: () => setClearingAll(false),
        });
    };

    const handleDeleteOne = (e, id) => {
        e.stopPropagation();
        if (deletingId === id) return;
        setDeletingId(id);
        router.delete(route("admin.notifications.destroy", id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const handleNotificationClick = (item) => {
        navigateNotification(item);
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="space-y-5">
                {/* Filter Tabs & Safe Toolbar Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div
                        role="tablist"
                        aria-label="Notification filter"
                        className="admin-pill-track grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 rounded-lg border w-full sm:w-auto"
                    >
                        {[
                            { key: "all", label: "All" },
                            { key: "unread", label: "Unread" },
                            { key: "read", label: "Read" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={filter === tab.key}
                                onClick={() => handleFilterChange(tab.key)}
                                className={`px-3.5 py-2 sm:py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer text-center ${
                                    filter === tab.key
                                        ? "admin-pill-active"
                                        : "admin-pill-inactive"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {(stats.total ?? 0) > 0 && (
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                            <span className="sm:hidden text-xs text-[var(--text-muted)]">
                                {stats.total}{" "}
                                {stats.total === 1
                                    ? "notification"
                                    : "notifications"}
                            </span>
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                disabled={clearingAll}
                                className="admin-btn-danger admin-btn-sm inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                            >
                                <HiOutlineTrash className="w-3.5 h-3.5 shrink-0" />
                                <span>Delete All</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Notifications List */}
                {rows.length === 0 ? (
                    <div className="admin-card rounded-xl border p-6">
                        <EmptyState message="You have no notifications in this view." />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="space-y-2.5">
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
                                        data-unread={!isRead ? "true" : "false"}
                                        className="admin-card admin-item-card admin-notif-item rounded-xl border px-4 sm:px-5 py-3.5 flex items-start gap-2.5"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleNotificationClick(item)
                                            }
                                            className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className={`w-4 h-4 mt-0.5 shrink-0 ${NOTIFICATION_TONE_STYLES[tone]}`}
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    {!isRead && (
                                                        <>
                                                            <span
                                                                aria-hidden="true"
                                                                className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] shrink-0"
                                                            />
                                                            <span className="sr-only">
                                                                Unread notification:
                                                            </span>
                                                        </>
                                                    )}
                                                    <p
                                                        className={`text-xs sm:text-sm leading-snug ${
                                                            isRead
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
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingId === item.id}
                                            onClick={(e) =>
                                                handleDeleteOne(e, item.id)
                                            }
                                            aria-label="Delete notification"
                                            title="Delete notification"
                                            className="admin-icon-btn inline-flex items-center justify-center shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] transition-colors cursor-pointer disabled:opacity-45"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <PaginationBar links={paginationLinks} standalone />
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                open={clearModalOpen}
                title="Delete All Notifications"
                description="Are you sure you want to delete all notifications? This action cannot be undone."
                confirmLabel="Delete All"
                processing={clearingAll}
                onClose={() => !clearingAll && setClearModalOpen(false)}
                onConfirm={confirmDeleteAll}
            />
        </>
    );
}

NotificationsIndex.layout = (page) => (
    <AdminLayout title="Notifications">{page}</AdminLayout>
);
