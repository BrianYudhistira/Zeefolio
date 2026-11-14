import { Link } from "@inertiajs/react";
import {
    HiOutlineFolderOpen,
    HiOutlineCpuChip,
    HiOutlineBriefcase,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

export default function DashboardStatsGrid({ stats = {} }) {
    const statCards = [
        {
            label: "Total Projects",
            shortLabel: "Projects",
            value: stats.projects ?? 0,
            icon: HiOutlineFolderOpen,
            href: route("admin.projects.index"),
        },
        {
            label: "Tech Skills",
            shortLabel: "Skills",
            value: stats.skills ?? 0,
            icon: HiOutlineCpuChip,
            href: route("admin.skills.index"),
        },
        {
            label: "Experiences",
            shortLabel: "Experiences",
            value: stats.experiences ?? 0,
            icon: HiOutlineBriefcase,
            href: route("admin.experiences.index"),
        },
        {
            label: "Activity Logs",
            shortLabel: "Logs",
            value: stats.logs ?? 0,
            icon: HiOutlineClipboardDocumentList,
            href: null,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {statCards.map((item) => {
                const Icon = item.icon;
                const CardWrapper = item.href ? Link : "div";
                return (
                    <CardWrapper
                        key={item.label}
                        {...(item.href ? { href: item.href } : {})}
                        className={`rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 sm:p-5 hover:border-zinc-700 transition-colors ${
                            item.featured
                                ? "col-span-2 sm:col-span-1 flex items-center justify-between sm:block"
                                : "block"
                        }`}
                    >
                        <div
                            className={`flex items-center justify-between gap-2 ${
                                item.featured ? "sm:mb-3" : "mb-1.5 sm:mb-3"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {item.featured && (
                                    <span className="sm:hidden w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Icon className="w-3.5 h-3.5" />
                                    </span>
                                )}
                                <span className="text-xs font-medium text-zinc-400 truncate">
                                    <span className="sm:hidden">
                                        {item.shortLabel}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {item.label}
                                    </span>
                                </span>
                            </div>
                            <Icon
                                className={`w-4 h-4 text-zinc-500 shrink-0 ${
                                    item.featured ? "hidden sm:block" : ""
                                }`}
                            />
                        </div>
                        <p className="text-xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                            {Number(item.value).toLocaleString()}
                        </p>
                    </CardWrapper>
                );
            })}
        </div>
    );
}
