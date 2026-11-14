import {
    HiOutlineMagnifyingGlass,
    HiOutlineUserCircle,
} from "react-icons/hi2";
import { getRoleConfig, STATUS_CONFIG } from "./MemberStatsGrid";

export default function MemberListCard({
    members = [],
    availableRoles = [],
    selectedId,
    onSelectMember,
    roleFilter = "all",
    onRoleFilterChange,
    search = "",
    onSearchChange,
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
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-zinc-800 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 shrink-0">
                        Accounts ({members.length})
                    </h2>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onRoleFilterChange(tab.id)}
                                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0 capitalize ${
                                    roleFilter === tab.id
                                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                        : "text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <HiOutlineMagnifyingGlass className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search accounts..."
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
                    />
                </div>
            </div>

            {members.length === 0 ? (
                <p className="text-xs text-zinc-500 py-10 text-center">
                    No accounts found.
                </p>
            ) : (
                <div className="divide-y divide-zinc-800 max-h-64 sm:max-h-[600px] overflow-y-auto">
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
                                onClick={() => onSelectMember(member.id)}
                                className={`w-full text-left p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-zinc-800/80"
                                        : "hover:bg-zinc-800/30"
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
                                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                                        />
                                        <span className="hidden sm:inline">
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
