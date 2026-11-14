import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineGlobeAlt,
    HiOutlineUser,
} from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";

export default function TechStackCardItem({ item, onEdit, onDelete }) {
    const isCustom = !item.is_global;

    return (
        <div className="bg-zinc-900 p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-zinc-800/60 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <DeviconIcon
                        icon={item.icon}
                        name={item.name}
                        sizeClass="text-base sm:text-lg"
                        fallbackClass="text-xs font-semibold text-zinc-400"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                            {item.name}
                        </p>
                        {item.is_global ? (
                            <span
                                title="Global Default Skill"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shrink-0"
                            >
                                <HiOutlineGlobeAlt className="w-3 h-3 hidden sm:inline" />
                                Global
                            </span>
                        ) : (
                            <span
                                title="Custom Skill"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0"
                            >
                                <HiOutlineUser className="w-3 h-3 hidden sm:inline" />
                                Custom
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate capitalize">
                        {item.category?.name || "Uncategorized"}
                    </p>
                </div>
            </div>

            {isCustom && (
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit custom skill"
                    >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete custom skill"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
