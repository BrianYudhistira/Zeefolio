import {
    HiOutlinePlus,
    HiOutlineUserCircle,
} from "react-icons/hi2";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import { getRoleConfig, STATUS_CONFIG } from "@/Utils/memberHelpers";

export default function MemberListCard({
    members = [],
    availableRoles = [],
    selectedId,
    onSelectMember,
    roleFilter = "all",
    onRoleFilterChange,
    search = "",
    onSearchChange,
    visibleOnMobile = true,
    onCreateAccount = null,
}) {
    const filterTabs = [
        { id: "all", label: "All" },
        ...(availableRoles.length > 0
            ? availableRoles.map((r) => ({
                  id: r.name,
                  label:
                      r.name === "superadmin"
                          ? "Super"
                          : String(r.name).replace(/_/g, " "),
              }))
            : [
                  { id: "superadmin", label: "Super" },
                  { id: "admin", label: "Admin" },
                  { id: "member", label: "Member" },
              ]),
    ];

    return (
        <div
            className={`lg:col-span-5 admin-card rounded-xl border overflow-hidden ${
                visibleOnMobile ? "block" : "hidden lg:block"
            }`}
        >
            <div className="p-3.5 sm:p-4 border-b border-zinc-800 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 shrink-0">
                        Accounts ({members.length})
                    </h2>
                    {onCreateAccount && (
                        <button
                            type="button"
                            onClick={onCreateAccount}
                            className="admin-btn-primary admin-btn-sm hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                            <HiOutlinePlus className="w-4 h-4 shrink-0" />
                            <span>New Account</span>
                        </button>
                    )}
                </div>

                <div className="admin-scroll-strip flex items-center gap-1 overflow-x-auto pb-2 -mb-1">
                    {filterTabs.map((tab) => {
                        const isActive = roleFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => onRoleFilterChange(tab.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer shrink-0 capitalize ${
                                    isActive
                                        ? "admin-pill-active"
                                        : "admin-pill-inactive"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Search accounts..."
                    className="w-full"
                />
            </div>

            {members.length === 0 ? (
                <EmptyState message="No accounts found." />
            ) : (
                <div className="divide-y divide-zinc-800 lg:max-h-[600px] lg:overflow-y-auto">
                    {members.map((member) => {
                        const isSelected = selectedId === member.id;
                        const roleCfg = getRoleConfig(
                            member.role,
                            availableRoles
                        );
                        const statusCfg =
                            STATUS_CONFIG[member.status] ||
                            STATUS_CONFIG.active;

                        return (
                            <button
                                key={member.id}
                                type="button"
                                aria-current={isSelected ? "true" : undefined}
                                onClick={() => onSelectMember(member.id)}
                                className={`w-full text-left p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 border-l-2 transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-zinc-800/80 border-l-[var(--orange)]"
                                        : "border-l-transparent hover:bg-zinc-800/30"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    {member.photo_url ? (
                                        <img
                                            src={member.photo_url}
                                            alt={member.name}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                            <HiOutlineUserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <p className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                                                {member.name}
                                            </p>
                                            <span
                                                className={`px-1.5 py-0.5 rounded border text-[10px] font-medium shrink-0 ${roleCfg.badgeClass}`}
                                            >
                                                {roleCfg.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                                            @{member.username || "user"} •{" "}
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0 space-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                                        <span
                                            aria-hidden="true"
                                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                                        />
                                        <span className="sr-only sm:not-sr-only">
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
