import { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    NOTIFICATION_TONE_STYLES,
    getNotificationTone,
    navigateNotification,
} from "@/Utils/notificationHelpers";
import { getRoleConfig } from "@/Utils/roleHelpers";
import {
    HiOutlineBell,
    HiOutlineTrash,
    HiOutlinePlusCircle,
    HiOutlineCheckCircle,
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineArrowLeftOnRectangle,
    HiOutlineChevronDown,
    HiXMark,
    HiBars3,
} from "react-icons/hi2";

export default function TopBar({
    title = "Dashboard",
    headerActions = null,
    notifications = [],
    user = null,
    onLogout = null,
    onOpenSidebar,
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    const unreadCount = notifications.filter(
        (item) => !item.is_read && !item.read_at
    ).length;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target)
            ) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleMeta = user ? getRoleConfig(user?.role) : null;

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
        navigateNotification(item, () => setNotifOpen(false));
    };

    return (
        <header className="admin-topbar sticky top-0 z-20 h-14 backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="admin-topbar-inner w-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="admin-topbar-btn lg:hidden p-1.5 rounded-lg border transition-colors"
                        aria-label="Open Sidebar"
                    >
                        <HiBars3 className="w-5 h-5" />
                    </button>

                    <h1 className="admin-topbar-title text-sm sm:text-base font-semibold truncate">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {headerActions}

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setUserMenuOpen(false);
                                setNotifOpen((prev) => !prev);
                            }}
                            className="admin-topbar-bell relative transition-colors cursor-pointer"
                            title="Notifications"
                        >
                            <HiOutlineBell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="admin-notif-badge absolute min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="admin-notif-panel absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-[var(--text)]">
                                        Notifications
                                    </span>

                                    <div className="flex items-center gap-3">
                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleMarkAllAsRead}
                                                className="admin-notif-mark-read inline-flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                                            >
                                                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                                Mark all read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleClearPopup}
                                                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {notifications.length === 0 ? (
                                    <p className="text-xs text-[var(--text-muted)] py-8 text-center">
                                        No new notifications.
                                    </p>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                                        {notifications.map((item) => {
                                            const isRead = Boolean(
                                                item.is_read || item.read_at
                                            );
                                            const tone = getNotificationTone(
                                                item.message
                                            );
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
                                                    className="admin-notif-item px-4 py-3 flex items-start gap-2.5 cursor-pointer"
                                                >
                                                    <Icon
                                                        className={`w-4 h-4 mt-0.5 shrink-0 ${NOTIFICATION_TONE_STYLES[tone]}`}
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            {!isRead && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] shrink-0" />
                                                            )}
                                                            <p
                                                                className={`text-xs leading-snug ${isRead
                                                                    ? "text-[var(--text-muted)]"
                                                                    : "text-[var(--text)] font-medium"
                                                                    }`}
                                                            >
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-muted)] truncate">
                                                            {item.module && (
                                                                <span className="admin-notif-module-pill px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                                    {item.module}
                                                                </span>
                                                            )}
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

                                <div className="admin-notif-footer px-4 py-2.5 border-t text-center">
                                    <Link
                                        href={route("admin.notifications.index")}
                                        onClick={() => setNotifOpen(false)}
                                        className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Account Menu */}
                    {user && (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setNotifOpen(false);
                                    setUserMenuOpen((prev) => !prev);
                                }}
                                data-open={userMenuOpen ? "true" : undefined}
                                title={user.name}
                                className="admin-topbar-user-btn inline-flex items-center gap-2 h-8 pl-1 pr-1 sm:pr-2 rounded-full transition-colors cursor-pointer"
                            >
                                {user.photo_url ? (
                                    <img
                                        src={user.photo_url}
                                        alt={user.name}
                                        className="w-6 h-6 rounded-full object-cover border border-[var(--border-strong)] shrink-0"
                                    />
                                ) : (
                                    <span className="w-6 h-6 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center shrink-0">
                                        <HiOutlineUserCircle className="w-4 h-4 text-[var(--text-muted)]" />
                                    </span>
                                )}
                                <span className="hidden md:inline text-xs font-medium text-[var(--text)] max-w-[110px] truncate">
                                    {user.name}
                                </span>
                                <HiOutlineChevronDown
                                    className={`hidden sm:block w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${
                                        userMenuOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {userMenuOpen && (
                                <div className="admin-topbar-user-panel absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="px-3.5 py-3 border-b border-[var(--border)]">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-[var(--text)] truncate">
                                                {user.name}
                                            </p>
                                            {roleMeta && (
                                                <span
                                                    title={roleMeta.label}
                                                    data-role={user?.role}
                                                    className={`admin-role-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${roleMeta.badgeClass}`}
                                                >
                                                    <HiOutlineShieldCheck className="w-3 h-3" />
                                                    <span>{roleMeta.label}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href={route("admin.account.index")}
                                            onClick={() => setUserMenuOpen(false)}
                                            className={`admin-topbar-user-item flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors ${
                                                route().current("admin.account.*")
                                                    ? "font-medium text-[var(--text)]"
                                                    : "text-[var(--text-muted)]"
                                            }`}
                                        >
                                            <HiOutlineUserCircle className="w-4 h-4 shrink-0" />
                                            <span>Account Settings</span>
                                        </Link>
                                        <div className="my-1 border-t border-[var(--border)]" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                onLogout?.();
                                            }}
                                            className="admin-topbar-user-logout w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors cursor-pointer text-left"
                                        >
                                            <HiOutlineArrowLeftOnRectangle className="w-4 h-4 shrink-0" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
