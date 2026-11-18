import { HiOutlineArrowTopRightOnSquare, HiXMark } from "react-icons/hi2";
import { getDeviconClass } from "@/Utils/devicon";

export default function GlobalSkillModal({
    open,
    editingSkill,
    skillForm,
    categories = [],
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const previewIconClass = getDeviconClass(skillForm.data.icon);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        {editingSkill
                            ? "Edit Default Skill"
                            : "Add Default Skill"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Skill Name (Default)
                        </label>
                        <input
                            type="text"
                            required
                            value={skillForm.data.name}
                            onChange={(e) =>
                                skillForm.setData("name", e.target.value)
                            }
                            placeholder="e.g. Laravel, TypeScript, Docker"
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {skillForm.errors.name && (
                            <p className="text-xs text-red-400">
                                {skillForm.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label className="block text-xs font-medium text-zinc-300">
                                Devicon Name / Class
                            </label>
                            <a
                                href="https://devicon.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <span>Browse Devicon</span>
                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <input
                                type="text"
                                value={skillForm.data.icon}
                                onChange={(e) =>
                                    skillForm.setData("icon", e.target.value)
                                }
                                placeholder="e.g. laravel, react, tailwindcss"
                                className="flex-1 text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                {previewIconClass ? (
                                    <i
                                        className={`${previewIconClass} text-xl`}
                                    />
                                ) : (
                                    <span className="text-xs text-zinc-600">
                                        —
                                    </span>
                                )}
                            </div>
                        </div>
                        {skillForm.errors.icon && (
                            <p className="text-xs text-red-400">
                                {skillForm.errors.icon}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Skill Category
                        </label>
                        <select
                            value={skillForm.data.category_id}
                            onChange={(e) =>
                                skillForm.setData("category_id", e.target.value)
                            }
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        >
                            <option value="">Uncategorized</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {skillForm.errors.category_id && (
                            <p className="text-xs text-red-400">
                                {skillForm.errors.category_id}
                            </p>
                        )}
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={skillForm.processing}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-medium text-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {skillForm.processing
                                ? "Saving..."
                                : "Save Default Skill"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
