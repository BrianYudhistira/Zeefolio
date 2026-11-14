import {
    HiOutlineUserCircle,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineGlobeAlt,
    HiOutlineSparkles,
    HiOutlineFolderOpen,
    HiOutlineBriefcase,
    HiOutlineCpuChip,
    HiOutlineShieldCheck,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";
import {
    PROFICIENCY_LABELS,
    getRoleConfig,
    STATUS_CONFIG,
} from "./MemberStatsGrid";

export default function MemberDetailSlideOver({
    selectedMember,
    availableRoles = [],
    activeTab = "account",
    onTabChange,
    onEditAccount,
    onDeleteAccount,
    onPromoteSkill,
}) {
    if (!selectedMember) {
        return (
            <div className="lg:col-span-7">
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-8 sm:p-12 text-center">
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

    return (
        <div className="lg:col-span-7">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                {/* Member Header */}
                <div className="p-3.5 sm:p-5 border-b border-zinc-800 flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        {selectedMember.photo_url ? (
                            <img
                                src={selectedMember.photo_url}
                                alt={selectedMember.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                <HiOutlineUserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h3 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                                    {selectedMember.name}
                                </h3>
                                <span
                                    className={`px-1.5 sm:px-2 py-0.5 rounded border text-[10px] font-medium ${roleCfg.badgeClass}`}
                                >
                                    {roleCfg.label}
                                </span>
                                <span
                                    className={`px-1.5 sm:px-2 py-0.5 rounded border text-[10px] font-medium ${statusCfg.badgeClass}`}
                                >
                                    {statusCfg.label}
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                                @{selectedMember.username} •{" "}
                                {selectedMember.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {selectedMember.has_portfolio && (
                            <a
                                href={
                                    selectedMember.portfolio?.slug
                                        ? route("portfolio.index", {
                                              slug: selectedMember.portfolio
                                                  .slug,
                                          })
                                        : route(
                                              "admin.members.preview",
                                              selectedMember.id
                                          )
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
                                title={
                                    selectedMember.portfolio?.slug
                                        ? `/${selectedMember.portfolio.slug}`
                                        : "Preview portfolio"
                                }
                            >
                                <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                    {selectedMember.portfolio?.slug
                                        ? `/${selectedMember.portfolio.slug}`
                                        : "Preview"}
                                </span>
                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Inspector Tabs */}
                <div className="px-3.5 sm:px-5 pt-2.5 sm:pt-3 border-b border-zinc-800 flex items-center gap-3 sm:gap-4 overflow-x-auto">
                    {[
                        {
                            id: "account",
                            label: "Account & Role",
                            shortLabel: "Account",
                            icon: HiOutlineShieldCheck,
                        },
                        {
                            id: "skills",
                            label: `Skills (${
                                selectedMember.portfolio?.skills?.length || 0
                            })`,
                            shortLabel: `Skills (${
                                selectedMember.portfolio?.skills?.length || 0
                            })`,
                            icon: HiOutlineCpuChip,
                        },
                        {
                            id: "projects",
                            label: `Projects (${
                                selectedMember.portfolio?.projects?.length || 0
                            })`,
                            shortLabel: `Projects (${
                                selectedMember.portfolio?.projects?.length || 0
                            })`,
                            icon: HiOutlineFolderOpen,
                        },
                        {
                            id: "profile",
                            label: "Profile & Experience",
                            shortLabel: "Profile",
                            icon: HiOutlineBriefcase,
                        },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`pb-2.5 sm:pb-3 inline-flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                                    active
                                        ? "border-zinc-200 text-zinc-100"
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

                {/* Tab Content */}
                <div className="p-3.5 sm:p-5">
                    {activeTab === "account" && (
                        <div className="space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 sm:p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                                    <p className="text-[11px] text-zinc-500">
                                        Assigned Role
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-semibold text-zinc-100">
                                            {roleCfg.label}
                                        </span>
                                        <span className="text-xs font-mono text-zinc-500">
                                            {selectedMember.role}
                                        </span>
                                    </div>
                                    <p className="hidden sm:block text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                                        {roleCfg.description}
                                    </p>
                                </div>

                                <div className="p-3 sm:p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-2">
                                    <div className="flex sm:block items-center justify-between">
                                        <p className="text-[11px] text-zinc-500">
                                            Account Status
                                        </p>
                                        <p className="text-xs sm:text-sm font-semibold text-zinc-100 sm:mt-0.5 capitalize">
                                            {statusCfg.label}
                                        </p>
                                    </div>
                                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                                        <span className="text-zinc-500">
                                            Portfolio Status
                                        </span>
                                        <span className="text-zinc-300">
                                            {selectedMember.portfolio?.is_active
                                                ? "Active"
                                                : selectedMember.has_portfolio
                                                  ? "Draft"
                                                  : "Uninitialized"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500">
                                            Joined
                                        </span>
                                        <span className="text-zinc-300">
                                            {selectedMember.created_at
                                                ? new Date(
                                                      selectedMember.created_at
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500">
                                            Last Login
                                        </span>
                                        <span className="text-zinc-300 font-mono text-[11px]">
                                            {selectedMember.last_login_at
                                                ? new Date(
                                                      selectedMember.last_login_at
                                                  ).toLocaleString("en-GB", {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : "Never"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500">
                                            IP / Location
                                        </span>
                                        <span className="text-zinc-300 font-mono text-[11px]">
                                            {selectedMember.ip_address || "—"}
                                            {selectedMember.location
                                                ? ` (${selectedMember.location})`
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Actions Box */}
                            <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-200">
                                        Account & Role Actions
                                    </p>
                                    <p className="hidden sm:block text-xs text-zinc-500 mt-0.5">
                                        {selectedMember.can_edit
                                            ? "Update profile credentials, reset password, change role, or suspend access."
                                            : "You have read-only access to this higher-privilege account."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {selectedMember.can_edit && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEditAccount(selectedMember)
                                            }
                                            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                                        >
                                            <HiOutlinePencilSquare className="w-4 h-4" />
                                            <span>Configure Account</span>
                                        </button>
                                    )}

                                    {selectedMember.can_delete && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDeleteAccount(selectedMember)
                                            }
                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 text-xs font-medium transition-colors cursor-pointer"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "skills" && (
                        <div className="space-y-6">
                            {/* Custom Skills Created by this Member */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        Custom Skills Created by{" "}
                                        {selectedMember.name} (
                                        {selectedMember.custom_skills?.length ||
                                            0}
                                        )
                                    </h4>
                                </div>

                                {!selectedMember.custom_skills?.length ? (
                                    <p className="text-xs text-zinc-500 py-4 px-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                                        This member has not created any custom skills yet.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {selectedMember.custom_skills.map(
                                            (cs) => (
                                                <div
                                                    key={cs.id}
                                                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                                            <DeviconIcon
                                                                icon={cs.icon}
                                                                name={cs.name}
                                                                sizeClass="text-base"
                                                                fallbackClass="text-[11px] font-semibold text-zinc-400"
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-medium text-zinc-100 truncate">
                                                                {cs.name}
                                                            </p>
                                                            <p className="text-[11px] text-zinc-500 capitalize">
                                                                {cs.category ||
                                                                    "Uncategorized"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {!cs.is_global && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onPromoteSkill(
                                                                    cs
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-medium text-zinc-200 transition-colors shrink-0 cursor-pointer"
                                                            title="Promote to Global Default Skill"
                                                        >
                                                            <HiOutlineSparkles className="w-3 h-3" />
                                                            <span>
                                                                Make Global
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Portfolio Active Skills */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Skills Used in Portfolio (
                                    {selectedMember.portfolio?.skills?.length ||
                                        0}
                                    )
                                </h4>

                                {!selectedMember.portfolio?.skills?.length ? (
                                    <p className="text-xs text-zinc-500 py-4 px-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                                        No skills attached to this member&apos;s portfolio.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-zinc-800 rounded-lg bg-zinc-950/60 border border-zinc-800 overflow-hidden">
                                        {selectedMember.portfolio.skills.map(
                                            (skill) => (
                                                <div
                                                    key={skill.id}
                                                    className="px-4 py-2.5 flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                                            <DeviconIcon
                                                                icon={
                                                                    skill
                                                                        .tech_stack
                                                                        ?.icon
                                                                }
                                                                name={
                                                                    skill
                                                                        .tech_stack
                                                                        ?.name
                                                                }
                                                                sizeClass="text-sm"
                                                                fallbackClass="text-[10px] font-semibold text-zinc-400"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-xs font-medium text-zinc-200 truncate">
                                                                {
                                                                    skill
                                                                        .tech_stack
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="text-[11px] text-zinc-500 capitalize">
                                                                •{" "}
                                                                {skill
                                                                    .tech_stack
                                                                    ?.category ||
                                                                    "Uncategorized"}
                                                            </span>
                                                            {!skill.tech_stack
                                                                ?.is_global && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400">
                                                                    Custom
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span className="text-xs text-zinc-400 shrink-0">
                                                        {
                                                            skill.proficiency_level
                                                        }
                                                        /5 (
                                                        {
                                                            PROFICIENCY_LABELS[
                                                                skill
                                                                    .proficiency_level
                                                            ]
                                                        }
                                                        )
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "projects" && (
                        <div className="space-y-3">
                            {!selectedMember.portfolio?.projects?.length ? (
                                <p className="text-xs text-zinc-500 py-6 text-center">
                                    No projects added by this member yet.
                                </p>
                            ) : (
                                selectedMember.portfolio.projects.map(
                                    (project) => (
                                        <div
                                            key={project.id}
                                            className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-start justify-between gap-4"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-zinc-100">
                                                        {project.title}
                                                    </p>
                                                    {project.project_type && (
                                                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 capitalize">
                                                            {
                                                                project.project_type
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400 line-clamp-2">
                                                    {project.description}
                                                </p>
                                                {project.tech_stacks?.length >
                                                    0 && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {project.tech_stacks.map(
                                                            (t) => (
                                                                <span
                                                                    key={t}
                                                                    className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400"
                                                                >
                                                                    {t}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {project.slug && (
                                                <a
                                                    href={route(
                                                        "portfolio.project",
                                                        {
                                                            slug:
                                                                selectedMember
                                                                    .portfolio
                                                                    ?.slug ||
                                                                selectedMember.username,
                                                            projectSlug:
                                                                project.slug,
                                                        }
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                                                    title="Open project detail"
                                                >
                                                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="space-y-5">
                            {!selectedMember.has_portfolio ? (
                                <p className="text-xs text-zinc-500 py-6 text-center">
                                    This member has not set up a portfolio yet.
                                </p>
                            ) : (
                                <>
                                    <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
                                        <p className="text-xs text-zinc-500">
                                            {selectedMember.portfolio?.home
                                                ?.greeting || "Hello, I am"}{" "}
                                            <span className="text-zinc-200 font-medium">
                                                {selectedMember.portfolio?.home
                                                    ?.name ||
                                                    selectedMember.name}
                                            </span>
                                        </p>
                                        <p className="text-xs text-zinc-300 leading-relaxed">
                                            {selectedMember.portfolio?.home
                                                ?.description ||
                                                "No bio description provided."}
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                            Experiences (
                                            {selectedMember.portfolio
                                                ?.experiences?.length || 0}
                                            )
                                        </h4>
                                        {!selectedMember.portfolio?.experiences
                                            ?.length ? (
                                            <p className="text-xs text-zinc-500">
                                                No experience entries added.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedMember.portfolio.experiences.map(
                                                    (exp) => (
                                                        <div
                                                            key={exp.id}
                                                            className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-zinc-200">
                                                                    {
                                                                        exp.position
                                                                    }
                                                                </p>
                                                                <p className="text-zinc-500">
                                                                    {
                                                                        exp.company
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="text-zinc-400">
                                                                {exp.date}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
