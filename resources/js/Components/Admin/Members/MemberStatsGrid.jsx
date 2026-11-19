import {
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineGlobeAlt,
} from "react-icons/hi2";
export {
    ROLE_CONFIG,
    getRoleConfig,
    PROFICIENCY_LABELS,
    STATUS_CONFIG,
} from "@/Utils/memberHelpers";

export default function MemberStatsGrid({
    totalCount = 0,
    superAdminCount = 0,
    adminCount = 0,
    memberCount = 0,
    activeFilter = "all",
    onFilterChange,
}) {
    const cards = [
        {
            filterKey: "all",
            label: "Total Accounts",
            shortLabel: "Total",
            value: totalCount,
            icon: HiOutlineUserCircle,
            accent: "var(--orange)",
        },
        {
            filterKey: "superadmin",
            label: "Super Admins",
            shortLabel: "Super",
            value: superAdminCount,
            icon: HiOutlineShieldCheck,
            accent: "var(--amber)",
        },
        {
            filterKey: "admin",
            label: "Admins",
            shortLabel: "Admins",
            value: adminCount,
            icon: HiOutlineShieldCheck,
            accent: "var(--indigo)",
        },
        {
            filterKey: "member",
            label: "Members",
            shortLabel: "Members",
            value: memberCount,
            icon: HiOutlineGlobeAlt,
            accent: "var(--emerald)",
        },
    ];

    const handleCardClick = (filterKey) => {
        if (!onFilterChange) return;
        onFilterChange(
            filterKey === "all"
                ? "all"
                : activeFilter === filterKey
                  ? "all"
                  : filterKey
        );
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {cards.map((item) => {
                const Icon = item.icon;
                const isActive = activeFilter === item.filterKey;
                return (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => handleCardClick(item.filterKey)}
                        data-active={isActive ? "true" : "false"}
                        aria-pressed={isActive}
                        title={
                            item.filterKey === "all"
                                ? "Show all accounts"
                                : `Filter by ${item.label}`
                        }
                        style={{ "--accent": item.accent }}
                        className="admin-stat-card rounded-xl border p-3 sm:p-4 flex items-center justify-between gap-2 text-left w-full cursor-pointer active:scale-[0.99]"
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
                            <p className="text-xl sm:text-2xl font-semibold text-[var(--text)] mt-0.5 sm:mt-1 tabular-nums">
                                {item.value}
                            </p>
                        </div>
                        <span className="admin-stat-icon-box inline-flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
