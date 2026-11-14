import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import EmptyState from "@/Components/UI/EmptyState";
import {
    HiOutlineBell,
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
        const isRead = Boolean(item.is_read || item.read_at);
        const targetUrl = item.action_url;

        if (!isRead) {
            router.put(
                route("admin.notifications.read", item.id),
                {},
                {
                    preserveScroll: true,
                    onFinish: () => {
                        if (targetUrl) {
                            router.visit(targetUrl);
                        }
                    },
                }
            );
            return;
        }

        if (targetUrl) {
            router.visit(targetUrl);
        }
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/25 text-zinc-300 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
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
                <div className="flex items-center gap-2">
                    {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "read", label: "Read" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleFilterChange(tab.key)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${filter === tab.key
                                ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                                : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                    {rows.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={HiOutlineBell}
                                title="No notifications"
                                description="You have no notifications in this view."
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/70">
                            {rows.map((item) => {
                                const isRead = Boolean(
                                    item.is_read || item.read_at
                                );
                                const msg = item.message || "";
                                const isDelete =
                                    msg.toLowerCase().includes("deleted") ||
                                    msg.toLowerCase().includes("removed");
                                const isAdd =
                                    msg.toLowerCase().includes("added") ||
                                    msg.toLowerCase().includes("created") ||
                                    msg.toLowerCase().includes("promoted");

                                return (
                                    <div
                                        key={item.id}
                                        role="button"
                                        tabIndex={0}
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
                                        className={`px-4 sm:px-5 py-3.5 transition-colors flex items-start gap-3.5 cursor-pointer ${isRead
                                            ? "bg-transparent opacity-65 hover:bg-zinc-800/30 hover:opacity-95"
                                            : "bg-zinc-800/55 hover:bg-zinc-800/80"
                                            }`}
                                    >
                                        <div
                                            className={`mt-0.5 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${isDelete
                                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                : isAdd
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    : "bg-zinc-800 border-zinc-700 text-zinc-300"
                                                }`}
                                        >
                                            {isDelete ? (
                                                <HiOutlineTrash className="w-4 h-4" />
                                            ) : (
                                                <HiOutlinePlusCircle className="w-4 h-4" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-xs sm:text-sm leading-snug ${isRead
                                                    ? "text-zinc-300"
                                                    : "text-zinc-100 font-medium"
                                                    }`}
                                            >
                                                {item.message}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                                                {item.module && (
                                                    <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[10px]">
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
                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {paginationLinks.length > 3 && (
                        <div className="px-4 py-3 border-t border-zinc-800 flex flex-wrap items-center justify-center sm:justify-end gap-1.5 bg-zinc-950/30">
                            {paginationLinks.map((link, idx) => {
                                const label = link.label
                                    .replace("&laquo; Previous", "Prev")
                                    .replace("Next &raquo;", "Next");

                                if (!link.url) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg text-xs text-zinc-600 border border-transparent select-none"
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${link.active
                                            ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                                            }`}
                                        dangerouslySetInnerHTML={{
                                            __html: label,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
