import { HiOutlineSparkles } from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";
import { PROFICIENCY_LABELS } from "@/Utils/memberHelpers";

export default function MemberSkillsTab({
    selectedMember,
    onPromoteSkill,
}) {
    const customSkills = selectedMember.custom_skills || [];
    const portfolioSkills = selectedMember.portfolio?.skills || [];

    return (
        <div className="space-y-6">
            {/* Custom Skills Created by this Member */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Custom Skills Created by {selectedMember.name} (
                    {customSkills.length})
                </h4>

                {customSkills.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 px-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        This member has not created any custom skills yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {customSkills.map((cs) => (
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
                                        <p className="text-[11px] text-zinc-500 capitalize truncate">
                                            {cs.category || "Uncategorized"}
                                        </p>
                                    </div>
                                </div>

                                {!cs.is_global && (
                                    <button
                                        type="button"
                                        onClick={() => onPromoteSkill(cs)}
                                        className="admin-btn-secondary admin-btn-xs inline-flex items-center justify-center font-medium transition-colors shrink-0 cursor-pointer"
                                        title="Set as Default Skill for all users"
                                    >
                                        <HiOutlineSparkles className="w-3 h-3" />
                                        <span>Make Default</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Portfolio Active Skills */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Skills Used in Portfolio ({portfolioSkills.length})
                </h4>

                {portfolioSkills.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 px-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        No skills attached to this member&apos;s portfolio.
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-800 rounded-lg bg-zinc-950/60 border border-zinc-800 overflow-hidden">
                        {portfolioSkills.map((skill) => {
                            const levelLabel =
                                PROFICIENCY_LABELS[skill.proficiency_level] ||
                                "Unknown";
                            return (
                                <div
                                    key={skill.id}
                                    className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2.5 sm:gap-3"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                            <DeviconIcon
                                                icon={skill.tech_stack?.icon}
                                                name={skill.tech_stack?.name}
                                                sizeClass="text-sm"
                                                fallbackClass="text-[10px] font-semibold text-zinc-400"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                                <span className="text-xs font-medium text-zinc-200 truncate">
                                                    {skill.tech_stack?.name}
                                                </span>
                                                <span className="text-[11px] text-zinc-500 capitalize truncate">
                                                    •{" "}
                                                    {skill.tech_stack
                                                        ?.category ||
                                                        "Uncategorized"}
                                                </span>
                                                {!skill.tech_stack?.is_global && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-[11px] sm:text-xs text-zinc-400 shrink-0 tabular-nums">
                                        <span className="sm:hidden">
                                            {skill.proficiency_level}/5
                                        </span>
                                        <span className="hidden sm:inline">
                                            {skill.proficiency_level}/5 (
                                            {levelLabel})
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
