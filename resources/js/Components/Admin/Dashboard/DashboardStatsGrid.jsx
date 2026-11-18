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
            accent: "var(--orange)",
        },
        {
            label: "Tech Skills",
            shortLabel: "Skills",
            value: stats.skills ?? 0,
            icon: HiOutlineCpuChip,
            href: route("admin.skills.index"),
            accent: "var(--indigo)",
        },
        {
            label: "Experiences",
            shortLabel: "Experiences",
            value: stats.experiences ?? 0,
            icon: HiOutlineBriefcase,
            href: route("admin.experiences.index"),
            accent: "var(--emerald)",
        },
        {
            label: "Activity",
            shortLabel: "Activity",
            value: stats.logs ?? 0,
            icon: HiOutlineClipboardDocumentList,
            href: null,
            accent: "var(--amber)",
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
                        style={{ "--accent": item.accent }}
                        className="admin-stat-card rounded-xl border p-3.5 sm:p-5 block"
                    >
                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3">
                            <span className="text-xs font-medium text-[var(--text-muted)] truncate min-w-0">
                                <span className="sm:hidden">
                                    {item.shortLabel}
                                </span>
                                <span className="hidden sm:inline">
                                    {item.label}
                                </span>
                            </span>
                            <span className="admin-stat-icon-box inline-flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
                            {Number(item.value).toLocaleString()}
                        </p>
                    </CardWrapper>
                );
            })}
        </div>
    );
}
