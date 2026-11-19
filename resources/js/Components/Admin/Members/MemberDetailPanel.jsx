import {
    HiOutlineUserCircle,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineFolderOpen,
    HiOutlineBriefcase,
    HiOutlineCpuChip,
    HiOutlineShieldCheck,
} from "react-icons/hi2";
import { getRoleConfig, STATUS_CONFIG } from "@/Utils/memberHelpers";
import MemberAccountTab from "./tabs/MemberAccountTab";
import MemberSkillsTab from "./tabs/MemberSkillsTab";
import MemberProjectsTab from "./tabs/MemberProjectsTab";
import MemberProfileTab from "./tabs/MemberProfileTab";

export default function MemberDetailPanel({
    selectedMember,
    availableRoles = [],
    activeTab = "account",
    onTabChange,
    onEditAccount,
    onDeleteAccount,
    onPromoteSkill,
    visibleOnMobile = true,
    panelRef = null,
}) {
    if (!selectedMember) {
        return (
            <div
                ref={panelRef}
                className={`lg:col-span-7 scroll-mt-20 ${visibleOnMobile ? "block" : "hidden lg:block"}`}
            >
                <div className="admin-card rounded-xl border p-8 sm:p-12 text-center">
                    <p className="text-xs text-zinc-500">
                        Select an account above to manage their role, status, and portfolio.
                    </p>
                </div>
            </div>
        );
    }

    const roleCfg = getRoleConfig(selectedMember.role, availableRoles);
    const statusCfg =
        STATUS_CONFIG[selectedMember.status] || STATUS_CONFIG.active;

    const tabs = [
        {
            id: "account",
            label: "Account & Role",
            shortLabel: "Account",
            icon: HiOutlineShieldCheck,
        },
        {
            id: "skills",
            label: `Skills (${selectedMember.portfolio?.skills?.length || 0})`,
            shortLabel: `Skills (${selectedMember.portfolio?.skills?.length || 0})`,
            icon: HiOutlineCpuChip,
        },
        {
            id: "projects",
            label: `Projects (${selectedMember.portfolio?.projects?.length || 0})`,
            shortLabel: `Projects (${selectedMember.portfolio?.projects?.length || 0})`,
            icon: HiOutlineFolderOpen,
        },
        {
            id: "profile",
            label: "Profile & Experience",
            shortLabel: "Profile",
            icon: HiOutlineBriefcase,
        },
    ];

    return (
        <div
            ref={panelRef}
            className={`lg:col-span-7 scroll-mt-20 ${visibleOnMobile ? "block" : "hidden lg:block"}`}
        >
            <div className="admin-card rounded-xl border overflow-hidden">
                {/* Account Header */}
                <div className="p-4 sm:p-5 border-b border-zinc-800 space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            {selectedMember.photo_url ? (
                                <img
                                    src={selectedMember.photo_url}
                                    alt={selectedMember.name}
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-zinc-700 shrink-0"
                                />
                            ) : (
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                                    <HiOutlineUserCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                                </div>
                            )}

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h3 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                                        {selectedMember.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-0.5 rounded border text-[10px] font-medium ${roleCfg.badgeClass}`}
                                    >
                                        {roleCfg.label}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded border text-[10px] font-medium ${statusCfg.badgeClass}`}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                                    @{selectedMember.username} •{" "}
                                    {selectedMember.email}
                                </p>
                            </div>
                        </div>

                        {selectedMember.has_portfolio && (
                            <a
                                href={route("portfolio.index", {
                                    slug:
                                        selectedMember.portfolio?.slug ||
                                        selectedMember.username,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${selectedMember.name}'s public portfolio`}
                                title="Open Public Portfolio"
                                className="admin-btn-ghost admin-btn-sm admin-btn-mobile-icon inline-flex items-center justify-center font-medium transition-colors shrink-0"
                            >
                                <span className="hidden sm:inline">
                                    {selectedMember.portfolio?.slug
                                        ? `/${selectedMember.portfolio.slug}`
                                        : "Preview"}
                                </span>
                                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 shrink-0" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Inspector Tabs */}
                <div className="admin-scroll-strip overflow-x-auto pt-1.5 sm:pt-2 pb-2">
                    <div
                        role="tablist"
                        aria-label="Member details sections"
                        className="inline-flex min-w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 border-b border-zinc-800"
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    id={`member-tab-${tab.id}`}
                                    aria-selected={active}
                                    aria-controls={`member-panel-${tab.id}`}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`py-2.5 sm:py-3 -mb-px inline-flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] ${
                                        active
                                            ? "border-[var(--orange)] text-zinc-100"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="sm:hidden">
                                        {tab.shortLabel}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div
                    role="tabpanel"
                    id={`member-panel-${activeTab}`}
                    aria-labelledby={`member-tab-${activeTab}`}
                    className="px-3.5 pb-3.5 pt-2 sm:px-5 sm:pb-5 sm:pt-3.5"
                >
                    {activeTab === "account" && (
                        <MemberAccountTab
                            selectedMember={selectedMember}
                            roleCfg={roleCfg}
                            statusCfg={statusCfg}
                            onEditAccount={onEditAccount}
                            onDeleteAccount={onDeleteAccount}
                        />
                    )}
                    {activeTab === "skills" && (
                        <MemberSkillsTab
                            selectedMember={selectedMember}
                            onPromoteSkill={onPromoteSkill}
                        />
                    )}
                    {activeTab === "projects" && (
                        <MemberProjectsTab selectedMember={selectedMember} />
                    )}
                    {activeTab === "profile" && (
                        <MemberProfileTab selectedMember={selectedMember} />
                    )}
                </div>
            </div>
        </div>
    );
}
