import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Admin/Sidebar";
import TopBar from "@/Components/Admin/TopBar";
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineTrash,
    HiXMark,
} from "react-icons/hi2";

export default function AdminLayout({
    title = "Dashboard",
    headerActions = null,
    children,
}) {
    const { auth, flash, notifications = [] } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const appName = import.meta.env.VITE_APP_NAME || "Zeefolio";

    useEffect(() => {
        if (flash?.success) {
            setToast({
                id: flash.id || Date.now(),
                type: "success",
                title:
                    flash.success.toLowerCase().includes("deleted") ||
                    flash.success.toLowerCase().includes("removed")
                        ? "Deleted"
                        : "Success",
                message: flash.success,
            });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({
                id: flash.id || Date.now(),
                type: "error",
                title: "Error",
                message: flash.error,
            });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.id, flash?.success, flash?.error]);

    useEffect(() => {
        const handleCustomNotify = (e) => {
            const detail = e.detail || {};
            if (!detail.message) return;
            setToast({
                id: Date.now(),
                type: detail.type || "success",
                title: detail.title || "Notification",
                message: detail.message,
            });
        };
        window.addEventListener("admin:notify", handleCustomNotify);
        return () =>
            window.removeEventListener("admin:notify", handleCustomNotify);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast?.id]);

    const handleLogout = () => {
        router.post(route("admin.logout"));
    };

    return (
        <div className="w-full bg-zinc-950 text-zinc-200 antialiased selection:bg-zinc-800 selection:text-zinc-100 min-h-screen font-sans flex">
            <Sidebar
                appName={appName}
                user={user}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <TopBar
                    title={title}
                    headerActions={headerActions}
                    notifications={notifications}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
            </div>

            {/* Floating Toast Notification */}
            {toast && (
                <div className="fixed top-14 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto sm:min-w-[320px] rounded-xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-md p-3.5 flex items-start justify-between gap-3 transition-all">
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
                            <p className="text-xs font-semibold text-zinc-100">
                                {toast.title}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    >
                        <HiXMark className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
