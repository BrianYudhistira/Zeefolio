import { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Admin/Sidebar";
import TopBar from "@/Components/Admin/TopBar";
import { useAdminTheme } from "@/Hooks/useAdminTheme";
import { useNotificationStream } from "@/Hooks/useNotificationStream";
import { getNotificationTone } from "@/Utils/notificationHelpers";
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineTrash,
    HiXMark,
} from "react-icons/hi2";

export default function AdminLayout({ title = "Dashboard", children }) {
    const { auth, flash, notifications = [] } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const toastSeqRef = useRef(0);
    const { theme, isTransitioning, toggleTheme } = useAdminTheme();

    const appName = import.meta.env.VITE_APP_NAME || "ZeeFolio";

    const liveNotifications = useNotificationStream({
        userId: user?.id,
        initialNotifications: notifications,
        // Show floating toast for external/system events (avoid duplicating flash toast on self-actions)
        onExternalNotification: (incoming) => {
            toastSeqRef.current += 1;
            setToast({
                id: `sse_${incoming.id}_${toastSeqRef.current}`,
                type: incoming.type === "error" ? "error" : "success",
                title: incoming.title || "Notification",
                message: incoming.message,
            });
        },
    });

    useEffect(() => {
        if (flash?.success) {
            toastSeqRef.current += 1;
            setToast({
                id: flash.id || `flash_ok_${toastSeqRef.current}`,
                type: "success",
                title:
                    getNotificationTone(flash.success) === "delete"
                        ? "Deleted"
                        : "Success",
                message: flash.success,
            });
            return;
        }
        if (flash?.error) {
            toastSeqRef.current += 1;
            setToast({
                id: flash.id || `flash_err_${toastSeqRef.current}`,
                type: "error",
                title: "Error",
                message: flash.error,
                durationMs: 5000,
            });
        }
    }, [flash?.id, flash?.success, flash?.error]);

    useEffect(() => {
        const handleCustomNotify = (e) => {
            const detail = e.detail || {};
            if (!detail.message) return;
            toastSeqRef.current += 1;
            setToast({
                id: `custom_${toastSeqRef.current}`,
                type: detail.type || "success",
                title: detail.title || "Notification",
                message: detail.message,
                durationMs: detail.durationMs,
            });
        };
        window.addEventListener("admin:notify", handleCustomNotify);
        return () =>
            window.removeEventListener("admin:notify", handleCustomNotify);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(
            () => setToast(null),
            toast.durationMs || 4000
        );
        return () => clearTimeout(timer);
    }, [toast?.id, toast?.durationMs]);

    const handleLogout = () => {
        router.post(route("admin.logout"));
    };

    return (
        <div
            data-theme={theme}
            data-theme-transitioning={isTransitioning ? "true" : undefined}
            className="admin-theme w-full antialiased min-h-screen font-sans flex"
        >
            <Sidebar
                appName={appName}
                user={user}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="admin-main-shell flex-1 flex flex-col min-w-0 lg:pl-60">
                <div className="admin-main-frame flex-1 flex flex-col min-w-0">
                    <TopBar
                        title={title}
                        notifications={liveNotifications}
                        user={user}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onLogout={handleLogout}
                        onOpenSidebar={() => setSidebarOpen(true)}
                    />

                    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-6 sm:pb-8">
                        {children}
                    </main>
                </div>
            </div>

            {/* Floating Toast Notification */}
            {toast && (
                <div
                    role={toast.type === "error" ? "alert" : "status"}
                    aria-live={toast.type === "error" ? "assertive" : "polite"}
                    aria-atomic="true"
                    className="admin-toast fixed top-14 left-4 right-4 mx-auto sm:left-auto sm:right-5 sm:mx-0 z-50 max-w-sm sm:w-auto sm:min-w-[320px] rounded-xl border shadow-2xl backdrop-blur-md p-3.5 flex items-start justify-between gap-2.5 transition-all"
                >
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className={`mt-0.5 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                                toast.type === "error" ||
                                toast.title === "Deleted"
                                    ? "bg-red-500/10 border-red-500/25 text-red-400"
                                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            }`}
                        >
                            {toast.type === "error" ? (
                                <HiOutlineExclamationCircle className="w-4 h-4" />
                            ) : toast.title === "Deleted" ? (
                                <HiOutlineTrash className="w-4 h-4" />
                            ) : (
                                <HiOutlineCheckCircle className="w-4 h-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--text)]">
                                {toast.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        aria-label="Dismiss notification"
                        title="Dismiss"
                        className="p-2 -m-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                    >
                        <HiXMark className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
