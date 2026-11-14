import { useEffect, useRef, useState } from "react";
import {
    HiOutlineBell,
    HiOutlineTrash,
    HiOutlinePlusCircle,
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
                        title="Recent Skill & Portfolio Notifications"
                    >
                        <HiOutlineBell className="w-4 h-4" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-100">
                                    Notifications
                                </span>
                                <span className="text-[11px] text-zinc-500">
                                    {notifications.length} recent
                                </span>
                            </div>

                            {notifications.length === 0 ? (
                                <p className="text-xs text-zinc-500 py-8 text-center">
                                    No recent activity yet.
                                </p>
                            ) : (
                                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/80">
                                    {notifications.map((item) => {
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
                                                className="px-4 py-3 hover:bg-zinc-800/40 transition-colors flex items-start gap-3"
                                            >
                                                <div
                                                    className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                                                        isDelete
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
                                                    <p className="text-xs text-zinc-200 leading-snug">
                                                        {item.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                                                        <span>
                                                            {item.user?.name ||
                                                                "User"}
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
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

