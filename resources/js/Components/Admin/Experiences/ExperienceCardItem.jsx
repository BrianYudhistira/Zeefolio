import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
} from "react-icons/hi2";

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

export default function ExperienceCardItem({
    exp,
    idx,
    totalCount,
    movingId,
    onMove,
    onEdit,
    onDelete,
}) {
    const isMoving = movingId === exp.id;

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
                    <div className="inline-flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
                        <button
                            type="button"
                            disabled={idx === 0 || isMoving}
                            onClick={() => onMove(exp, "up")}
                            className="p-1 sm:p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Move up"
                        >
                            <HiOutlineArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            disabled={idx === totalCount - 1 || isMoving}
                            onClick={() => onMove(exp, "down")}
                            className="p-1 sm:p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Move down"
                        >
                            <HiOutlineArrowDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

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

            {exp.tech_stack && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                    {exp.tech_stack
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tech) => (
                            <span
                                key={tech}
                                className="px-1.5 sm:px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] text-zinc-400"
                            >
                                {tech}
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
}
