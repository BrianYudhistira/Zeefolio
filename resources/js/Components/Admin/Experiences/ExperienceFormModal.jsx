import { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { HiMagnifyingGlass, HiOutlinePlus, HiXMark } from "react-icons/hi2";
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        {editingItem ? "Edit Experience" : "Add Experience"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Organization / Company
                            </label>
                            <input
                                type="text"
                                required
                                value={data.company}
                                onChange={(e) =>
                                    setData("company", e.target.value)
                                }
                                placeholder="e.g. Acme Corp, University, Studio"
                                className="w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.company && (
                                <p className="text-xs text-red-400">
                                    {errors.company}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Role / Title
                            </label>
                            <input
                                type="text"
                                required
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                                placeholder="e.g. Project Manager, Designer, Staff"
                                className="w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
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
                            <label className="block text-xs font-medium text-zinc-300">
                                Start Date
                            </label>
                            <input
                                type="date"
                                required
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.start_date && (
                                <p className="text-xs text-red-400">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                End Date{" "}
                                <span className="text-zinc-500 font-normal">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
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
                            <label className="block text-xs font-medium text-zinc-300">
                                Skills ({data.skill_ids.length} selected)
                            </label>
                            {skills.length > 0 && (
                                <Link
                                    href={route("admin.skills.index")}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
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
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-100 transition-colors shrink-0"
                                >
                                    <HiOutlinePlus className="w-3.5 h-3.5" />
                                    <span>Add Skills</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
                                <div className="relative border-b border-zinc-800/80">
                                    <HiMagnifyingGlass className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={skillSearch}
                                        onChange={(e) =>
                                            setSkillSearch(e.target.value)
                                        }
                                        placeholder="Search your skills..."
                                        className="w-full text-xs pl-8 pr-3 py-2 bg-transparent text-zinc-200 placeholder-zinc-600 outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5">
                                    {filteredSkills.length === 0 ? (
                                        <p className="w-full py-1 px-1 text-xs text-zinc-500">
                                            No matching skill found in your list. Use{" "}
                                            <span className="text-emerald-400 font-medium">+ Add Skill</span> above to add one.
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
                                                    onClick={() =>
                                                        onToggleSkill?.(
                                                            skill.id
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                                        selected
                                                            ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                                                            : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                                                    }`}
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
                        <label className="block text-xs font-medium text-zinc-300">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Share what you did, your main responsibilities, or results..."
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-400">
                                {errors.description}
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
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-medium text-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing
                                ? "Saving..."
                                : editingItem
                                  ? "Save Changes"
                                  : "Save Experience"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
