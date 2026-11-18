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

function getLogTone(type) {
    switch (type?.toLowerCase()) {
        case "warning":
        case "admin":
            return "accent";
        case "error":
            return "danger";
        default:
            return "success";
    }
}

export default function ProfileSummaryCard({ recentLogs = [] }) {
    return (
        <div className="lg:col-span-5 admin-card rounded-xl border overflow-hidden">
            <div className="admin-card-header px-4 py-3 sm:px-5 sm:py-4 border-b flex items-center justify-between">
                <h2 className="text-sm font-medium text-[var(--text)]">
                    Recent Activity
                </h2>
                {recentLogs.length > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)]">
                        Latest {recentLogs.length}
                    </span>
                )}
            </div>

            {recentLogs.length === 0 ? (
                <div className="px-4 py-8 sm:px-5 sm:py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[color-mix(in_srgb,var(--orange)_12%,transparent)] border border-[color-mix(in_srgb,var(--orange)_26%,transparent)] flex items-center justify-center text-[var(--orange-text)] mb-2.5 sm:mb-3">
                        <HiOutlineClipboardDocumentList className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text)]">
                        No activity yet
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                        Logins, profile edits, and portfolio updates will appear here.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[var(--border)] max-h-80 sm:max-h-[26rem] overflow-y-auto">
                    {recentLogs.map((log) => (
                        <div
                            key={log.id}
                            className="px-4 py-3 sm:px-5 sm:py-3.5 space-y-1"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    data-tone={getLogTone(log.type)}
                                    className="admin-log-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                    {log.module || log.type}
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                                    {formatDate(log.created_at)}
                                </span>
                            </div>
                            <p className="text-xs text-[color-mix(in_srgb,var(--text)_86%,transparent)] line-clamp-2 sm:line-clamp-none">
                                {log.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
