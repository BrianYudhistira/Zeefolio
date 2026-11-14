import { HiOutlineTrash } from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";

export const PROFICIENCY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

export default function SkillRowItem({ skill, onLevelChange, onDelete }) {
    const isGlobal = skill.tech_stack?.is_global;

    return (
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <DeviconIcon
                        icon={skill.tech_stack?.icon}
                        name={skill.tech_stack?.name}
                        sizeClass="text-base sm:text-lg"
                        fallbackClass="text-xs font-semibold text-zinc-400"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                            {skill.tech_stack?.name}
                        </p>
                        {!isGlobal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                                Custom
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                        {skill.tech_stack?.category?.name || "Uncategorized"}
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
                    onChange={(e) =>
                        onLevelChange(skill, Number(e.target.value))
                    }
                    aria-label="Proficiency level"
                    className="sm:hidden text-xs font-medium px-2 py-1 pr-6 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-0 outline-none"
                >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>
                            Lv.{lvl}
                        </option>
                    ))}
                </select>

                {/* Desktop Segmented Level Selector */}
                <div className="hidden sm:inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-950/90 border border-zinc-800/80">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                        const isCurrent = lvl === skill.proficiency_level;
                        const isFilled = lvl < skill.proficiency_level;
                        return (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => onLevelChange(skill, lvl)}
                                title={`Set level ${lvl} (${PROFICIENCY_LABELS[lvl]})`}
                                className={`w-6 h-6 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                    isCurrent
                                        ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                                        : isFilled
                                          ? "bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:text-zinc-200"
                                          : "bg-transparent text-zinc-600 border-transparent hover:text-zinc-300"
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
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove skill"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
