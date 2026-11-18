import {
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineGlobeAlt,
} from "react-icons/hi2";
export { ROLE_CONFIG, getRoleConfig } from "@/Utils/roleHelpers";

export const PROFICIENCY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

export const STATUS_CONFIG = {
    active: {
        label: "Active",
        dotClass: "bg-emerald-400",
        badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    },
    dnd: {
        label: "Do Not Disturb",
        dotClass: "bg-amber-400",
        badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    },
    banned: {
        label: "Suspended",
        dotClass: "bg-red-400",
        badgeClass: "bg-red-500/10 border-red-500/20 text-red-300",
    },
};

export default function MemberStatsGrid({
    totalCount = 0,
    superAdminCount = 0,
    adminCount = 0,
    memberCount = 0,
}) {
    const cards = [
        {
            label: "Total Accounts",
            shortLabel: "Total",
            value: totalCount,
            icon: HiOutlineUserCircle,
            accent: "var(--orange)",
        },
        {
            label: "Super Admins",
            shortLabel: "Super",
            value: superAdminCount,
            icon: HiOutlineShieldCheck,
            accent: "var(--amber)",
        },
        {
            label: "Admins",
            shortLabel: "Admins",
            value: adminCount,
            icon: HiOutlineShieldCheck,
            accent: "var(--indigo)",
        },
        {
            label: "Members",
            shortLabel: "Members",
            value: memberCount,
            icon: HiOutlineGlobeAlt,
            accent: "var(--emerald)",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {cards.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        style={{ "--accent": item.accent }}
                        className="admin-stat-card rounded-xl border p-3 sm:p-4 flex items-center justify-between gap-2"
                    >
                        <div>
                            <p className="text-[11px] sm:text-xs font-medium text-[var(--text-muted)]">
                                <span className="sm:hidden">
                                    {item.shortLabel}
                                </span>
                                <span className="hidden sm:inline">
                                    {item.label}
                                </span>
                            </p>
                            <p className="text-xl sm:text-2xl font-semibold text-[var(--text)] mt-0.5 sm:mt-1">
                                {item.value}
                            </p>
                        </div>
                        <span className="admin-stat-icon-box inline-flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
