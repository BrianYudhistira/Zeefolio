import { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import PaginationBar from "@/Components/UI/PaginationBar";
import { formatTimeParts } from "@/Utils/dateHelpers";
import {
    HiOutlineDocumentText,
    HiOutlineInformationCircle,
    HiOutlineExclamationTriangle,
    HiOutlineXCircle,
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
    const searchTimerRef = useRef(null);

    useEffect(() => {
        setSearch(filters.search || "");
        setModuleFilter(filters.module || "all");
        setTypeFilter(filters.type || "all");
    }, [filters.search, filters.module, filters.type]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

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
            only: ["logs", "filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (value === "") {
            applyFilters({ search: "" });
            return;
        }

        searchTimerRef.current = setTimeout(() => {
            applyFilters({ search: value });
        }, 300);
    };

    const handleModuleChange = (e) => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        const val = e.target.value;
        setModuleFilter(val);
        applyFilters({ module: val });
    };

    const handleTypeChange = (e) => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        const val = e.target.value;
        setTypeFilter(val);
        applyFilters({ type: val });
    };

    const handleStatFilterClick = (targetType) => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        const nextType =
            targetType === "all"
                ? "all"
                : typeFilter === targetType
                  ? "all"
                  : targetType;
        if (nextType === typeFilter) return;
        setTypeFilter(nextType);
        applyFilters({ type: nextType });
    };

    return (
        <>
            <Head title="Activity Logs" />

            <div className="space-y-5">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                    {[
                        {
                            filterType: "all",
                            label: "Total",
                            value: stats.total ?? 0,
                            accent: "var(--orange)",
                        },
                        {
                            filterType: "admin",
                            label: "Admin",
                            value: stats.admin ?? 0,
                            accent: "var(--indigo)",
                        },
                        {
                            filterType: "info",
                            label: "Normal",
                            value: stats.info ?? 0,
                            accent: "var(--emerald)",
                        },
                        {
                            filterType: "warning",
                            label: "Warnings",
                            value: stats.warning ?? 0,
                            accent: "var(--amber)",
                        },
                        {
                            filterType: "error",
                            label: "Errors",
                            value: stats.error ?? 0,
                            accent: "var(--danger)",
                        },
                    ].map((stat, idx) => {
                        const isActive = typeFilter === stat.filterType;
                        return (
                            <button
                                key={stat.label}
                                type="button"
                                onClick={() =>
                                    handleStatFilterClick(stat.filterType)
                                }
                                data-active={isActive ? "true" : "false"}
                                aria-pressed={isActive}
                                title={
                                    stat.filterType === "all"
                                        ? "Show all activity logs"
                                        : `Filter by ${stat.label}`
                                }
                                style={{ "--accent": stat.accent }}
                                className={`admin-stat-card rounded-xl border p-3.5 sm:p-4 text-left w-full cursor-pointer active:scale-[0.99] ${
                                    idx === 0 ? "col-span-2 sm:col-span-1" : ""
                                }`}
                            >
                                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: stat.accent }}
                                    />
                                    <span>{stat.label}</span>
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-[var(--text)] mt-1 tabular-nums">
                                    {stat.value}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Filters Bar */}
                <div className="admin-card rounded-xl border p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search activity, user, location, or section..."
                        />
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="relative flex-1 sm:flex-initial">
                            <HiOutlineFunnel className="w-3.5 h-3.5 text-[var(--indigo)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                aria-label="Filter by section"
                                value={moduleFilter}
                                onChange={handleModuleChange}
                                className="admin-input w-full sm:w-40 pl-8 pr-7 py-2.5 sm:py-2 rounded-lg border text-xs focus:outline-none"
                            >
                                <option value="all">All Sections</option>
                                {modules.map((mod) => (
                                    <option key={mod} value={mod}>
                                        {mod}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            aria-label="Filter by type"
                            value={typeFilter}
                            onChange={handleTypeChange}
                            className="admin-input flex-1 sm:flex-initial sm:w-40 px-3 py-2.5 sm:py-2 rounded-lg border text-xs focus:outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="admin">Admin</option>
                            <option value="info">Normal</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>

                {/* Logs Table / List */}
                <div className="admin-card rounded-xl border overflow-hidden">
                    <div className="px-5 sm:px-6 py-3.5 border-b border-[var(--border)] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <HiOutlineDocumentText className="w-4 h-4 text-[var(--amber)] shrink-0" />
                            <h2 className="text-sm font-semibold text-zinc-100 truncate">
                                Activity History
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {logRows.length > 0 && (
                                <span className="md:hidden text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                    Swipe ↔
                                </span>
                            )}
                            <span className="text-[11px] sm:text-xs text-zinc-500 font-mono tabular-nums">
                                <span className="sm:hidden">
                                    {logRows.length > 0
                                        ? `${logs.from || 0}–${logs.to || 0} / ${logs.total || 0}`
                                        : "0 / 0"}
                                </span>
                                <span className="hidden sm:inline">
                                    Showing{" "}
                                    {logRows.length > 0
                                        ? `${logs.from || 0}–${logs.to || 0}`
                                        : "0–0"}{" "}
                                    of {logRows.length > 0 ? logs.total || 0 : 0}
                                </span>
                            </span>
                        </div>
                    </div>

                    {logRows.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={HiOutlineDocumentText}
                                title="No activity found"
                                description="No activity matches your current filters."
                            />
                        </div>
                    ) : (
                        <>

                        <div className="admin-scroll-strip overflow-x-auto pb-1.5">
                            <table className="w-full min-w-[680px] text-left border-collapse">
                                <thead>
                                    <tr className="admin-table-head border-b text-[11px] font-mono uppercase">
                                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                            Time
                                        </th>
                                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                            User
                                        </th>
                                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                            Section / Type
                                        </th>
                                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                            Activity
                                        </th>
                                        <th className="py-3 px-4 sm:py-3.5 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                            Location & IP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)] text-xs">
                                    {logRows.map((log) => {
                                        const typeMeta = getTypeStyle(
                                            log.type
                                        );
                                        const TypeIcon = typeMeta.icon;
                                        const timeParts = formatTimeParts(
                                            log.created_at
                                        );

                                        return (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-zinc-800/30 transition-colors align-top"
                                            >
                                                <td
                                                    className="py-3.5 px-4 sm:py-4 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 font-mono tabular-nums whitespace-nowrap"
                                                    title={
                                                        timeParts
                                                            ? `${timeParts.date}, ${timeParts.time}`
                                                            : undefined
                                                    }
                                                >
                                                    {timeParts ? (
                                                        <div>
                                                            <div className="text-[11px] font-medium text-zinc-200">
                                                                {timeParts.date}
                                                            </div>
                                                            <div className="text-[11px] text-zinc-500 mt-0.5">
                                                                {timeParts.time}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-zinc-500">
                                                            -
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 sm:py-4 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300 tabular-nums">
                                                            ID:{" "}
                                                            {log.user_id ?? "-"}
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
                                                                        log.user
                                                                            .email
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 sm:py-4 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap">
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

                                                <td className="py-3.5 px-4 sm:py-4 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 text-zinc-200 min-w-[220px] max-w-md">
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

                                                <td className="py-3.5 px-4 sm:py-4 sm:px-5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 whitespace-nowrap text-zinc-400 font-mono text-[11px] tabular-nums">
                                                    <div>
                                                        {log.ip_address || "-"}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-sans">
                                                        <HiOutlineGlobeAlt className="w-3 h-3" />
                                                        <span>
                                                            {log.location ||
                                                                "Unknown"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                            <PaginationBar links={paginationLinks} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

LogsIndex.layout = (page) => (
    <AdminLayout title="Activity Logs">{page}</AdminLayout>
);
