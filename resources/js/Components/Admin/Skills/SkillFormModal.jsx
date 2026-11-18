import { useEffect, useState } from "react";
import {
    HiOutlineArrowTopRightOnSquare,
    HiOutlinePlus,
} from "react-icons/hi2";
import { getDeviconClass } from "@/Utils/devicon";
import { PROFICIENCY_LABELS } from "./SkillRowItem";

export default function SkillFormModal({
    mode = "existing",
    onSwitchMode,
    availableTechStacks = [],
    categories = [],
    data,
    setData,
    errors,
    processing,
    resetKey = 0,
    onSubmit,
}) {
    const [creatingCategory, setCreatingCategory] = useState(false);
    const customIconPreview = getDeviconClass(data.icon);

    useEffect(() => {
        setCreatingCategory(false);
    }, [resetKey]);

    const handleToggleNewCategory = () => {
        if (creatingCategory) {
            setCreatingCategory(false);
            setData("custom_category", "");
            return;
        }

        setCreatingCategory(true);
        setData("category_id", "");
    };

    return (
        <form
            onSubmit={onSubmit}
            className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-3.5 sm:space-y-4 lg:sticky lg:top-20"
        >
            <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                    Add Skill
                </h2>
                <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                    Pick from ready-made skills or add your own custom skill.
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                <button
                    type="button"
                    onClick={() => onSwitchMode("existing")}
                    className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${mode === "existing"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <span className="sm:hidden">List</span>
                    <span className="hidden sm:inline">Pick from List</span>
                </button>
                <button
                    type="button"
                    onClick={() => onSwitchMode("custom")}
                    className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${mode === "custom"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <span className="sm:hidden">+ New</span>
                    <span className="hidden sm:inline">+ Add Custom</span>
                </button>
            </div>

            {mode === "existing" ? (
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Skill
                    </label>
                    <select
                        required
                        value={data.tech_stack_id}
                        onChange={(e) =>
                            setData("tech_stack_id", e.target.value)
                        }
                        className="w-full text-sm px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    >
                        <option value="">Choose a skill...</option>
                        {availableTechStacks.map((ts) => (
                            <option key={ts.id} value={ts.id}>
                                {ts.name}
                                {ts.category?.name
                                    ? ` (${ts.category.name})`
                                    : ""}
                                {!ts.is_global ? " • Custom" : ""}
                            </option>
                        ))}
                    </select>
                    {errors.tech_stack_id && (
                        <p className="text-xs text-red-400">
                            {errors.tech_stack_id}
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Skill Name
                        </label>
                        <input
                            type="text"
                            required
                            value={data.custom_name}
                            onChange={(e) =>
                                setData("custom_name", e.target.value)
                            }
                            placeholder="e.g. Figma, Public Speaking, Excel"
                            className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {errors.custom_name && (
                            <p className="text-xs text-red-400">
                                {errors.custom_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label className="block text-xs font-medium text-zinc-300">
                                Category
                            </label>
                            <button
                                type="button"
                                onClick={handleToggleNewCategory}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                            >
                                {!creatingCategory && (
                                    <HiOutlinePlus className="w-3 h-3" />
                                )}
                                <span>
                                    {creatingCategory
                                        ? "Choose Existing"
                                        : "New Category"}
                                </span>
                            </button>
                        </div>

                        {creatingCategory ? (
                            <input
                                type="text"
                                value={data.custom_category}
                                onChange={(e) =>
                                    setData("custom_category", e.target.value)
                                }
                                placeholder="e.g. Design, Marketing, Tools"
                                maxLength={50}
                                className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                        ) : (
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            >
                                <option value="">No Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                        {!cat.is_global ? " • Custom" : ""}
                                    </option>
                                ))}
                            </select>
                        )}
                        {(errors.custom_category || errors.category_id) && (
                            <p className="text-xs text-red-400">
                                {errors.custom_category || errors.category_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label className="block text-xs font-medium text-zinc-300">
                                Skill Icon{" "}
                                <span className="text-zinc-500 font-normal">
                                    (Optional)
                                </span>
                            </label>
                            <a
                                href="https://devicon.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <span>Find Icon</span>
                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={data.icon}
                                onChange={(e) =>
                                    setData("icon", e.target.value)
                                }
                                placeholder="e.g. figma (leave blank for auto)"
                                className="flex-1 text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                                {customIconPreview ? (
                                    <i
                                        className={`${customIconPreview} text-base`}
                                    />
                                ) : (
                                    <span className="text-xs font-semibold text-zinc-500">
                                        {data.custom_name
                                            ?.trim()
                                            .charAt(0)
                                            .toUpperCase() || "—"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                            Leave blank to automatically show the first letter as the icon.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">
                        Skill Level
                    </label>
                    <span className="text-xs text-zinc-400">
                        {data.proficiency_level}/5 —{" "}
                        {PROFICIENCY_LABELS[data.proficiency_level]}
                    </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                            key={lvl}
                            type="button"
                            onClick={() => setData("proficiency_level", lvl)}
                            className={`py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${data.proficiency_level === lvl
                                ? "bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm"
                                : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300"
                                }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={
                    processing ||
                    (mode === "existing"
                        ? !data.tech_stack_id
                        : !data.custom_name.trim())
                }
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
                <HiOutlinePlus className="w-4 h-4" />
                <span>
                    {mode === "custom" ? "Save & Add Skill" : "Add Skill"}
                </span>
            </button>
        </form>
    );
}
