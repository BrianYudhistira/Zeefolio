import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineGlobeAlt,
} from "react-icons/hi2";
import DeviconIcon from "@/Components/UI/DeviconIcon";

export default function GlobalSkillsList({
    filteredSkills = [],
    categories = [],
    selectedCategory = "all",
    onSelectCategory,
    search = "",
    onSearchChange,
    onEditSkill,
    onDeleteSkill,
}) {
    return (
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-zinc-800 space-y-2.5 sm:space-y-0 sm:flex sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-2">
                        <HiOutlineGlobeAlt className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">
                            Global Skills ({filteredSkills.length})
                        </h3>
                    </div>
                    {selectedCategory !== "all" && (
                        <button
                            type="button"
                            onClick={() => onSelectCategory("all")}
                            className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile Category Select */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => onSelectCategory(e.target.value)}
                        aria-label="Filter by category"
                        className="lg:hidden text-xs px-2.5 py-2 pr-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-0 outline-none shrink-0 max-w-[140px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <div className="relative flex-1 sm:w-64">
                        <HiOutlineMagnifyingGlass className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search skills..."
                            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {filteredSkills.length === 0 ? (
                <p className="text-xs text-zinc-500 py-12 text-center">
                    No global skills match your search.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-800">
                    {filteredSkills.map((skill) => (
                        <div
                            key={skill.id}
                            className="bg-zinc-900 p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-zinc-800/60 transition-colors"
                        >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                    <DeviconIcon
                                        icon={skill.icon}
                                        name={skill.name}
                                        sizeClass="text-base sm:text-lg"
                                        fallbackClass="text-xs font-semibold text-zinc-400"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                                            {skill.name}
                                        </p>
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 shrink-0">
                                            Global
                                        </span>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate capitalize">
                                        {skill.category?.name ||
                                            "Uncategorized"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEditSkill(skill)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Edit global skill"
                                >
                                    <HiOutlinePencilSquare className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteSkill(skill)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    title="Delete global skill"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
