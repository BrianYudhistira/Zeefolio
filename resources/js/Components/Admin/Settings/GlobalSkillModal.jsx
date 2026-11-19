import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";
import { getDeviconClass } from "@/Utils/devicon";

export default function GlobalSkillModal({
    open,
    editingSkill,
    skillForm,
    categories = [],
    onClose,
    onSubmit,
}) {
    const previewIconClass = getDeviconClass(skillForm.data.icon);

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={
                editingSkill ? "Edit Default Skill" : "Add Default Skill"
            }
            maxWidthClass="max-w-md"
            preventClose={skillForm.processing}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="global-skill-name"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Skill Name (Default)
                        </label>
                        <input
                            id="global-skill-name"
                            type="text"
                            required
                            value={skillForm.data.name}
                            onChange={(e) =>
                                skillForm.setData("name", e.target.value)
                            }
                            placeholder="e.g. Laravel, TypeScript, Docker"
                            aria-invalid={Boolean(skillForm.errors.name)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                        />
                        {skillForm.errors.name && (
                            <p className="text-xs text-red-400">
                                {skillForm.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label
                                htmlFor="global-skill-icon"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Devicon Name / Class
                            </label>
                            <a
                                href="https://devicon.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 py-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <span>Browse Devicon</span>
                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <input
                                id="global-skill-icon"
                                type="text"
                                value={skillForm.data.icon}
                                onChange={(e) =>
                                    skillForm.setData("icon", e.target.value)
                                }
                                placeholder="e.g. laravel, react, tailwindcss"
                                aria-invalid={Boolean(skillForm.errors.icon)}
                                className="admin-input flex-1 min-w-0 text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                {previewIconClass ? (
                                    <i
                                        className={`${previewIconClass} text-xl`}
                                    />
                                ) : (
                                    <span className="text-xs text-zinc-600">
                                        {skillForm.data.name
                                            ?.trim()
                                            .charAt(0)
                                            .toUpperCase() || "—"}
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
                        <label
                            htmlFor="global-skill-category"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Skill Category
                        </label>
                        <select
                            id="global-skill-category"
                            value={skillForm.data.category_id}
                            onChange={(e) =>
                                skillForm.setData("category_id", e.target.value)
                            }
                            aria-invalid={Boolean(skillForm.errors.category_id)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
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
                </div>

                <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={skillForm.processing}
                        className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={skillForm.processing}
                        className="admin-btn-primary admin-btn-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {skillForm.processing
                            ? "Saving..."
                            : editingSkill
                              ? "Save Changes"
                              : "Add Skill"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
