import { HiOutlineTrash } from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";
import { PROFICIENCY_LABELS } from "@/Utils/memberHelpers";

export { PROFICIENCY_LABELS };

export default function SkillRowItem({
    skill,
    updating = false,
    onLevelChange,
    onDelete,
}) {
    const isGlobal = skill.tech_stack?.is_global;
    const skillName = skill.tech_stack?.name || "Skill";

    return (
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <DeviconIcon
                        icon={skill.tech_stack?.icon}
                        name={skillName}
                        sizeClass="text-base sm:text-lg"
                        fallbackClass="text-xs font-semibold text-zinc-400"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                            {skillName}
                        </p>
                        {!isGlobal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                                Custom
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                        {skill.tech_stack?.category?.name || "No Category"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <span className="hidden md:inline-block text-[11px] text-zinc-500">
                    {PROFICIENCY_LABELS[skill.proficiency_level]}
                </span>

                {/* Mobile Compact Level Dropdown */}
                <select
                    value={skill.proficiency_level}
                    disabled={updating}
                    onChange={(e) =>
                        onLevelChange(skill, Number(e.target.value))
                    }
                    aria-label={`Proficiency level for ${skillName}`}
                    className="sm:hidden text-xs font-medium px-2.5 py-2 pr-6 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-0 outline-none disabled:opacity-50"
                >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>
                            Lv.{lvl} — {PROFICIENCY_LABELS[lvl]}
                        </option>
                    ))}
                </select>

                {/* Desktop Segmented Level Selector */}
                <div
                    role="group"
                    aria-label={`Proficiency level for ${skillName}`}
                    className="admin-pill-track hidden sm:inline-flex items-center gap-1 p-1 rounded-lg border"
                >
                    {[1, 2, 3, 4, 5].map((lvl) => {
                        const isCurrent = lvl === skill.proficiency_level;
                        const isFilled = lvl < skill.proficiency_level;
                        return (
                            <button
                                key={lvl}
                                type="button"
                                disabled={updating}
                                aria-pressed={isCurrent}
                                aria-label={`Set ${skillName} level ${lvl} (${PROFICIENCY_LABELS[lvl]})`}
                                onClick={() => onLevelChange(skill, lvl)}
                                title={`Set level ${lvl} (${PROFICIENCY_LABELS[lvl]})`}
                                className={`w-7 h-7 rounded-md text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isCurrent
                                        ? "admin-pill-active font-semibold"
                                        : isFilled
                                          ? "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-strong)]"
                                          : "bg-transparent text-[color-mix(in_srgb,var(--text-muted)_55%,transparent)] border-transparent hover:bg-[var(--surface)] hover:text-[var(--text)]"
                                }`}
                            >
                                {lvl}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => onDelete(skill)}
                    aria-label={`Remove skill ${skillName}`}
                    className="admin-icon-btn inline-flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove skill"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
