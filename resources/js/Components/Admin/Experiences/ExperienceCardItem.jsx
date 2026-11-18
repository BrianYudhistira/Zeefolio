import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";
import { getDeviconClass } from "@/Utils/devicon";

export function formatDateInput(val) {
    if (!val) return "";
    return String(val).slice(0, 10);
}

export function formatMonthYear(val) {
    if (!val) return "Present";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function parseSkillNames(rawSkills) {
    if (!rawSkills) return [];
    return String(rawSkills)
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
}

export default function ExperienceCardItem({
    exp,
    skillIconByName,
    idx,
    onEdit,
    onDelete,
}) {
    const skillNames = parseSkillNames(exp.tech_stack);

    return (
        <div className="p-3.5 sm:p-5 space-y-2 hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                            #{idx + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                            {exp.position}
                        </h3>
                        <span className="text-xs text-zinc-400 truncate">
                            @ {exp.company}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] sm:text-[11px] text-zinc-300">
                            {formatMonthYear(exp.start_date)} —{" "}
                            {formatMonthYear(exp.end_date)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => onEdit(exp)}
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
                        title="Edit"
                    >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(exp)}
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-3 sm:line-clamp-none">
                {exp.description}
            </p>

            {skillNames.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                    {skillNames.map((skillName) => {
                        const iconClass = getDeviconClass(
                            skillIconByName?.get(skillName.toLowerCase())
                        );
                        return (
                            <span
                                key={skillName}
                                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] text-zinc-400"
                            >
                                {iconClass && (
                                    <i className={`${iconClass} text-[11px]`} />
                                )}
                                <span>{skillName}</span>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
