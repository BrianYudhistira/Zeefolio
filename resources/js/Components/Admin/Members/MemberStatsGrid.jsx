import {
    HiOutlineUserCircle,
    HiOutlineShieldCheck,
    HiOutlineGlobeAlt,
    HiXMark,
} from "react-icons/hi2";

export const PROFICIENCY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

export const ROLE_CONFIG = {
    superadmin: {
        label: "Super Admin",
        badgeClass: "bg-amber-500/10 border-amber-500/25 text-amber-300",
        description:
            "Full system control: manage all accounts, assign/revoke Admin & Super Admin roles, manage Global Skills & Categories, and inspect all portfolios.",
    },
    admin: {
        label: "Admin",
        badgeClass: "bg-sky-500/10 border-sky-500/25 text-sky-300",
        description:
            "Platform moderator: manage Global Skills & Categories, inspect all portfolios, promote custom skills, and manage Member accounts (cannot modify Admins or Super Admins).",
    },
    member: {
        label: "Member",
        badgeClass: "bg-zinc-800 border-zinc-700 text-zinc-300",
        description:
            "Standard user: manage personal portfolio (Home, Projects, Skills, Experiences, Custom Tech Stacks, Contacts).",
    },
};

export function getRoleConfig(roleName, availableRoles = []) {
    if (ROLE_CONFIG[roleName]) {
        return ROLE_CONFIG[roleName];
    }
    const found = availableRoles.find((r) => r.name === roleName);
    const label = roleName
        ? String(roleName).replace(/_/g, " ")
        : "Member";
    return {
        label,
        badgeClass:
            "bg-purple-500/10 border-purple-500/25 text-purple-300 capitalize",
        description:
            found?.description ||
            `Custom Spatie role "${label}" with custom permission assignments.`,
    };
}

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
    showRoleGuide = false,
    onCloseRoleGuide,
}) {
    return (
        <>
            {showRoleGuide && (
                <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                <HiOutlineShieldCheck className="w-4 h-4 text-zinc-300" />
                                <span>Role & Permission Hierarchy (3 Roles)</span>
                            </h2>
                            <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                                Overview of access levels across Super Admin, Admin, and Member accounts.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onCloseRoleGuide}
                            className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
                        >
                            <HiXMark className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                            <div
                                key={key}
                                className="p-3.5 sm:p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5 sm:space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`px-2 py-0.5 rounded border text-[11px] font-medium ${cfg.badgeClass}`}
                                    >
                                        {cfg.label}
                                    </span>
                                    <span className="text-[11px] font-mono text-zinc-500">
                                        role: {key}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {cfg.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] sm:text-xs font-medium text-zinc-400">
                            <span className="sm:hidden">Total</span>
                            <span className="hidden sm:inline">Total Accounts</span>
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-zinc-100 mt-0.5 sm:mt-1">
                            {totalCount}
                        </p>
                    </div>
                    <HiOutlineUserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 shrink-0" />
                </div>

                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] sm:text-xs font-medium text-amber-300/80">
                            <span className="sm:hidden">Super</span>
                            <span className="hidden sm:inline">Super Admins</span>
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-zinc-100 mt-0.5 sm:mt-1">
                            {superAdminCount}
                        </p>
                    </div>
                    <HiOutlineShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/70 shrink-0" />
                </div>

                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] sm:text-xs font-medium text-sky-300/80">
                            Admins
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-zinc-100 mt-0.5 sm:mt-1">
                            {adminCount}
                        </p>
                    </div>
                    <HiOutlineShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400/70 shrink-0" />
                </div>

                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] sm:text-xs font-medium text-zinc-400">
                            Members
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-zinc-100 mt-0.5 sm:mt-1">
                            {memberCount}
                        </p>
                    </div>
                    <HiOutlineGlobeAlt className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 shrink-0" />
                </div>
            </div>
        </>
    );
}
