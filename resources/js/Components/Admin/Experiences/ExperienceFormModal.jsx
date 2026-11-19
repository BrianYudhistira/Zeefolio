import { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { HiMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";
import { getDeviconClass } from "@/Utils/devicon";

export default function ExperienceFormModal({
    open,
    editingItem,
    data,
    setData,
    errors,
    processing,
    skills = [],
    onToggleSkill,
    onClose,
    onSubmit,
}) {
    const [skillSearch, setSkillSearch] = useState("");

    useEffect(() => {
        if (open) {
            setSkillSearch("");
        }
    }, [open]);

    const filteredSkills = useMemo(() => {
        const query = skillSearch.trim().toLowerCase();
        if (!query) return skills;
        return skills.filter(
            (skill) =>
                skill.name?.toLowerCase().includes(query) ||
                skill.category?.toLowerCase().includes(query)
        );
    }, [skills, skillSearch]);

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={editingItem ? "Edit Experience" : "Add Experience"}
            maxWidthClass="max-w-lg"
            preventClose={processing}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
                <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="exp-company"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Organization / Company
                            </label>
                            <input
                                id="exp-company"
                                type="text"
                                required
                                value={data.company}
                                onChange={(e) =>
                                    setData("company", e.target.value)
                                }
                                placeholder="e.g. Acme Corp, University, Studio"
                                aria-invalid={Boolean(errors.company)}
                                className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg border outline-none transition-colors"
                            />
                            {errors.company && (
                                <p className="text-xs text-red-400">
                                    {errors.company}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="exp-position"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Role / Title
                            </label>
                            <input
                                id="exp-position"
                                type="text"
                                required
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                                placeholder="e.g. Project Manager, Designer, Staff"
                                aria-invalid={Boolean(errors.position)}
                                className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg border outline-none transition-colors"
                            />
                            {errors.position && (
                                <p className="text-xs text-red-400">
                                    {errors.position}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="exp-start-date"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Start Date
                            </label>
                            <input
                                id="exp-start-date"
                                type="date"
                                required
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                aria-invalid={Boolean(errors.start_date)}
                                className="admin-input w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {errors.start_date && (
                                <p className="text-xs text-red-400">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="exp-end-date"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                End Date{" "}
                                <span className="text-zinc-500 font-normal">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                id="exp-end-date"
                                type="date"
                                min={data.start_date || undefined}
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                aria-invalid={Boolean(errors.end_date)}
                                className="admin-input w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {errors.end_date && (
                                <p className="text-xs text-red-400">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Synced User Skills Multi-Select */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <label
                                htmlFor="exp-skill-search"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Skills ({data.skill_ids.length} selected)
                            </label>
                            {skills.length > 0 && (
                                <Link
                                    href={route("admin.skills.index")}
                                    className="inline-flex items-center gap-1 py-1 px-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    <HiOutlinePlus className="w-3 h-3" />
                                    <span>Add Skill</span>
                                </Link>
                            )}
                        </div>

                        {skills.length === 0 ? (
                            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-xs text-zinc-400">
                                    You haven&apos;t added any skills yet. Add skills to your profile to link them here.
                                </p>
                                <Link
                                    href={route("admin.skills.index")}
                                    className="admin-btn-secondary admin-btn-sm inline-flex items-center justify-center font-medium transition-colors shrink-0"
                                >
                                    <HiOutlinePlus className="w-3.5 h-3.5" />
                                    <span>Add Skills</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
                                <div className="relative border-b border-zinc-800/80">
                                    <HiMagnifyingGlass
                                        className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="exp-skill-search"
                                        type="text"
                                        value={skillSearch}
                                        onChange={(e) =>
                                            setSkillSearch(e.target.value)
                                        }
                                        placeholder="Search your skills..."
                                        aria-label="Search your skills"
                                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-transparent text-zinc-200 placeholder-zinc-600 outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5">
                                    {filteredSkills.length === 0 ? (
                                        <p className="w-full py-1 px-1 text-xs text-zinc-500">
                                            No matching skill found in your list. Use{" "}
                                            <span className="text-emerald-400 font-medium">
                                                + Add Skill
                                            </span>{" "}
                                            above to add one.
                                        </p>
                                    ) : (
                                        filteredSkills.map((skill) => {
                                            const selected =
                                                data.skill_ids.includes(
                                                    skill.id
                                                );
                                            const iconClass = getDeviconClass(
                                                skill.icon
                                            );

                                            return (
                                                <button
                                                    key={skill.id}
                                                    type="button"
                                                    aria-pressed={selected}
                                                    data-selected={
                                                        selected
                                                            ? "true"
                                                            : "false"
                                                    }
                                                    onClick={() =>
                                                        onToggleSkill?.(
                                                            skill.id
                                                        )
                                                    }
                                                    className="admin-cat-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer"
                                                >
                                                    {iconClass && (
                                                        <i
                                                            className={`${iconClass} text-xs`}
                                                        />
                                                    )}
                                                    <span>{skill.name}</span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                        {(errors.skill_ids || errors.tech_stack) && (
                            <p className="text-xs text-red-400">
                                {errors.skill_ids || errors.tech_stack}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="exp-description"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Description
                        </label>
                        <textarea
                            id="exp-description"
                            rows={4}
                            required
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Share what you did, your main responsibilities, or results..."
                            aria-invalid={Boolean(errors.description)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-400">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="admin-btn-primary admin-btn-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {processing
                            ? "Saving..."
                            : editingItem
                              ? "Save Changes"
                              : "Add Experience"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
