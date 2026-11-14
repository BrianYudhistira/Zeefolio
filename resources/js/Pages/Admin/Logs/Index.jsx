import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import {
    HiOutlineDocumentText,
    HiOutlineInformationCircle,
    HiOutlineExclamationTriangle,
    HiOutlineXCircle,
    HiOutlineUser,
    HiOutlineGlobeAlt,
    HiOutlineFunnel,
    HiOutlineShieldCheck,
} from "react-icons/hi2";

function getTypeStyle(type) {
    switch (String(type || "info").toLowerCase()) {
        case "admin":
            return {
                label: "admin",
                badge: "bg-purple-500/10 border-purple-500/25 text-purple-300",
                icon: HiOutlineShieldCheck,
            };
        case "error":
        case "critical":
        case "emergency":
            return {
                label: type || "error",
                badge: "bg-red-500/10 border-red-500/25 text-red-400",
                icon: HiOutlineXCircle,
            };
        case "warning":
        case "alert":
            return {
                label: type || "warning",
                badge: "bg-amber-500/10 border-amber-500/25 text-amber-300",
                icon: HiOutlineExclamationTriangle,
            };
        default:
            return {
                label: type || "info",
                badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                icon: HiOutlineInformationCircle,
            };
    }
}

export default function LogsIndex({
    logs = {},
    modules = [],
    stats = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [moduleFilter, setModuleFilter] = useState(filters.module || "all");
    const [typeFilter, setTypeFilter] = useState(filters.type || "all");

    const logRows = Array.isArray(logs?.data) ? logs.data : [];
    const paginationLinks = Array.isArray(logs?.links) ? logs.links : [];

    const applyFilters = (nextParams = {}) => {
        const query = {
            search: nextParams.search !== undefined ? nextParams.search : search,
            module:
                nextParams.module !== undefined
                    ? nextParams.module
                    : moduleFilter,
            type: nextParams.type !== undefined ? nextParams.type : typeFilter,
        };

        Object.keys(query).forEach((key) => {
            if (!query[key] || query[key] === "all") {
                delete query[key];
            }
        });

        router.get(route("admin.logs.index"), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleModuleChange = (e) => {
        const val = e.target.value;
        setModuleFilter(val);
        applyFilters({ module: val });
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setTypeFilter(val);
        applyFilters({ type: val });
    };

    const formatDateTime = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        return d.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <AdminLayout title="Activity Logs">
            <Head title="Activity Logs - Zeefolio" />

            <div className="space-y-5">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                            Total Logs
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
                            {stats.total ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-purple-300/80">
                            Admin Access
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-300 mt-1">
                            {stats.admin ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/80">
                            Info Logs
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
                            {stats.info ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80">
                            Warnings
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
                            {stats.warning ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-red-400/80">
                            Errors
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
                            {stats.error ?? 0}
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search message, user name, user_id, IP, or module..."
                        />
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="relative flex-1 sm:flex-initial">
                            <HiOutlineFunnel className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={moduleFilter}
                                onChange={handleModuleChange}
                                className="w-full sm:w-40 pl-8 pr-7 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
                            >
                                <option value="all">All Modules</option>
                                {modules.map((mod) => (
                                    <option key={mod} value={mod}>
                                        {mod}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={typeFilter}
                            onChange={handleTypeChange}
                            className="flex-1 sm:flex-initial sm:w-40 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
                        >
                            <option value="all">All Levels</option>
                            <option value="admin">Admin Access</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>

                {/* Logs Table / List */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                    <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HiOutlineDocumentText className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-sm font-semibold text-zinc-100">
                                System Audit Logs
                            </h2>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">
                            Showing {logs.from || 0}–{logs.to || 0} of{" "}
                            {logs.total || 0}
                        </span>
                    </div>

                    {logRows.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={HiOutlineDocumentText}
                                title="No logs found"
                                description="No system activity logs match your current filter criteria."
                            />
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800/80 text-[11px] font-mono uppercase text-zinc-500 bg-zinc-950/40">
                                            <th className="py-3 px-4">ID</th>
                                            <th className="py-3 px-4">
                                                User (user_id & Name)
                                            </th>
                                            <th className="py-3 px-4">
                                                Module / Level
                                            </th>
                                            <th className="py-3 px-4">
                                                Activity Message
                                            </th>
                                            <th className="py-3 px-4">
                                                IP & Location
                                            </th>
                                            <th className="py-3 px-4 text-right">
                                                Timestamp
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/70 text-xs">
                                        {logRows.map((log) => {
                                            const typeMeta = getTypeStyle(
                                                log.type
                                            );
                                            const TypeIcon = typeMeta.icon;

                                            return (
                                                <tr
                                                    key={log.id}
                                                    className="hover:bg-zinc-800/30 transition-colors align-top"
                                                >
                                                    <td className="py-3.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                                                        #{log.id}
                                                    </td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300">
                                                                ID:{" "}
                                                                {log.user_id ??
                                                                    "-"}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-zinc-100 truncate">
                                                                    {log.user
                                                                        ?.name ||
                                                                        (log.user_id
                                                                            ? `Deleted User #${log.user_id}`
                                                                            : "Guest / System")}
                                                                </p>
                                                                {log.user
                                                                    ?.email && (
                                                                    <p className="text-[11px] text-zinc-500 truncate">
                                                                        {
                                                                            log
                                                                                .user
                                                                                .email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-[11px]">
                                                                {log.module ||
                                                                    "System"}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase ${typeMeta.badge}`}
                                                            >
                                                                <TypeIcon className="w-3 h-3" />
                                                                {typeMeta.label}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 text-zinc-200 max-w-md">
                                                        <p className="leading-relaxed break-words">
                                                            {log.message}
                                                        </p>
                                                        {log.user_agent && (
                                                            <p
                                                                className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5"
                                                                title={
                                                                    log.user_agent
                                                                }
                                                            >
                                                                {log.user_agent}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                                                        <div>
                                                            {log.ip_address ||
                                                                "-"}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-sans">
                                                            <HiOutlineGlobeAlt className="w-3 h-3" />
                                                            <span>
                                                                {log.location ||
                                                                    "Unknown"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-[11px] text-zinc-400">
                                                        {formatDateTime(
                                                            log.created_at
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List */}
                            <div className="md:hidden divide-y divide-zinc-800/70">
                                {logRows.map((log) => {
                                    const typeMeta = getTypeStyle(log.type);
                                    const TypeIcon = typeMeta.icon;

                                    return (
                                        <div
                                            key={log.id}
                                            className="p-4 space-y-2.5"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[11px] text-zinc-500">
                                                        #{log.id}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-medium">
                                                        {log.module || "System"}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase ${typeMeta.badge}`}
                                                    >
                                                        <TypeIcon className="w-3 h-3" />
                                                        {typeMeta.label}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono text-zinc-500">
                                                    {formatDateTime(
                                                        log.created_at
                                                    )}
                                                </span>
                                            </div>

                                            <p className="text-xs text-zinc-100 leading-relaxed">
                                                {log.message}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
                                                <div className="flex items-center gap-1.5">
                                                    <HiOutlineUser className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span className="px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300">
                                                        ID:{" "}
                                                        {log.user_id ?? "-"}
                                                    </span>
                                                    <span className="text-zinc-200 font-medium">
                                                        {log.user?.name ||
                                                            (log.user_id
                                                                ? `Deleted User #${log.user_id}`
                                                                : "Guest / System")}
                                                    </span>
                                                </div>

                                                <span className="font-mono text-[10px] text-zinc-500">
                                                    {log.ip_address || "-"} (
                                                    {log.location || "Unknown"})
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
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
                                        className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                            link.active
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
