import { HiOutlineClipboardDocumentList } from "react-icons/hi2";

function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getLogBadgeClass(type) {
    switch (type?.toLowerCase()) {
        case "warning":
            return "text-amber-300 bg-amber-500/10 border-amber-500/20";
        case "error":
            return "text-red-300 bg-red-500/10 border-red-500/20";
        default:
            return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
    }
}

export default function ProfileSummaryCard({ recentLogs = [] }) {
    return (
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-100">
                    Recent Activity
                </h2>
                {recentLogs.length > 0 && (
                    <span className="text-[11px] text-zinc-500">
                        Latest {recentLogs.length}
                    </span>
                )}
            </div>

            {recentLogs.length === 0 ? (
                <div className="px-4 py-8 sm:px-5 sm:py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-400 mb-2.5 sm:mb-3">
                        <HiOutlineClipboardDocumentList className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-sm font-medium text-zinc-200">
                        No activity logs yet
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                        Recent logins, profile edits, and portfolio changes will appear here.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-800 max-h-80 sm:max-h-[26rem] overflow-y-auto">
                    {recentLogs.map((log) => (
                        <div
                            key={log.id}
                            className="px-4 py-3 sm:px-5 sm:py-3.5 space-y-1"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getLogBadgeClass(
                                        log.type
                                    )}`}
                                >
                                    {log.module || log.type}
                                </span>
                                <span className="text-[11px] text-zinc-500 shrink-0">
                                    {formatDate(log.created_at)}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-300 line-clamp-2 sm:line-clamp-none">
                                {log.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
