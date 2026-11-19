import { useEffect, useState } from "react";
import {
    HiOutlineArrowTopRightOnSquare,
    HiOutlinePlus,
    HiXMark,
} from "react-icons/hi2";
import { getDeviconClass } from "@/Utils/devicon";
import { PROFICIENCY_LABELS } from "@/Utils/memberHelpers";

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
    onClose = null,
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
            className={`admin-card p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto ${
                onClose
                    ? "border-0 rounded-none"
                    : "rounded-xl border lg:sticky lg:top-20"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Add Skill
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Pick from ready-made skills or add your own custom skill.
                    </p>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        aria-label="Close modal"
                        title="Close"
                        className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-45"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="admin-pill-track grid grid-cols-2 gap-1 p-1 rounded-lg border">
                <button
                    type="button"
                    aria-pressed={mode === "existing"}
                    onClick={() => onSwitchMode("existing")}
                    className={`py-2 sm:py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        mode === "existing"
                            ? "admin-pill-active"
                            : "admin-pill-inactive"
                    }`}
                >
                    <span className="sm:hidden">List</span>
                    <span className="hidden sm:inline">Pick from List</span>
                </button>
                <button
                    type="button"
                    aria-pressed={mode === "custom"}
                    onClick={() => onSwitchMode("custom")}
                    className={`py-2 sm:py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        mode === "custom"
                            ? "admin-pill-active"
                            : "admin-pill-inactive"
                    }`}
                >
                    <span className="sm:hidden">+ New</span>
                    <span className="hidden sm:inline">+ Add Custom</span>
                </button>
            </div>

            {mode === "existing" ? (
                <div className="space-y-1.5">
                    <label
                        htmlFor="skill-existing-select"
                        className="block text-xs font-medium text-zinc-300"
                    >
                        Skill
                    </label>
                    <select
                        id="skill-existing-select"
                        required
                        value={data.tech_stack_id}
                        onChange={(e) =>
                            setData("tech_stack_id", e.target.value)
                        }
                        aria-invalid={Boolean(errors.tech_stack_id)}
                        className="admin-input w-full text-sm px-3 py-2.5 rounded-lg border outline-none transition-colors"
                    >
                        <option value="">
                            {availableTechStacks.length === 0
                                ? "All listed skills added — use + Add Custom"
                                : "Choose a skill..."}
                        </option>
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
                        <label
                            htmlFor="skill-custom-name"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Skill Name
                        </label>
                        <input
                            id="skill-custom-name"
                            type="text"
                            required
                            value={data.custom_name}
                            onChange={(e) =>
                                setData("custom_name", e.target.value)
                            }
                            placeholder="e.g. Figma, Public Speaking, Excel"
                            aria-invalid={Boolean(
                                errors.custom_name || errors.tech_stack_id
                            )}
                            className="admin-input w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
                        />
                        {errors.custom_name && (
                            <p className="text-xs text-red-400">
                                {errors.custom_name}
                            </p>
                        )}
                        {errors.tech_stack_id && (
                            <p className="text-xs text-red-400">
                                {errors.tech_stack_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label
                                htmlFor={
                                    creatingCategory
                                        ? "skill-custom-cat-input"
                                        : "skill-custom-cat-select"
                                }
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Category
                            </label>
                            <button
                                type="button"
                                onClick={handleToggleNewCategory}
                                className="inline-flex items-center gap-1 py-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
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
                                id="skill-custom-cat-input"
                                type="text"
                                value={data.custom_category}
                                onChange={(e) =>
                                    setData("custom_category", e.target.value)
                                }
                                placeholder="e.g. Design, Marketing, Tools"
                                maxLength={50}
                                className="admin-input w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
                            />
                        ) : (
                            <select
                                id="skill-custom-cat-select"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className="admin-input w-full text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
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
                            <label
                                htmlFor="skill-custom-icon"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Skill Icon{" "}
                                <span className="text-zinc-500 font-normal">
                                    (Optional)
                                </span>
                            </label>
                            <a
                                href="https://devicon.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 py-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <span>Find Icon</span>
                                <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="skill-custom-icon"
                                type="text"
                                value={data.icon}
                                onChange={(e) =>
                                    setData("icon", e.target.value)
                                }
                                placeholder="e.g. figma (leave blank for auto)"
                                className="admin-input flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
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
                        {errors.icon && (
                            <p className="text-xs text-red-400">
                                {errors.icon}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <fieldset className="space-y-2">
                <div className="flex items-center justify-between">
                    <legend className="text-xs font-medium text-zinc-300">
                        Skill Level
                    </legend>
                    <span className="text-xs text-zinc-400">
                        {data.proficiency_level}/5 —{" "}
                        {PROFICIENCY_LABELS[data.proficiency_level]}
                    </span>
                </div>
                <div className="admin-pill-track grid grid-cols-5 gap-1.5 p-1 rounded-lg border">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                            key={lvl}
                            type="button"
                            aria-pressed={data.proficiency_level === lvl}
                            aria-label={`Set skill level ${lvl}: ${PROFICIENCY_LABELS[lvl]}`}
                            onClick={() => setData("proficiency_level", lvl)}
                            className={`py-2 sm:py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                data.proficiency_level === lvl
                                    ? "admin-pill-active"
                                    : "admin-pill-inactive"
                            }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
                {errors.proficiency_level && (
                    <p className="text-xs text-red-400">
                        {errors.proficiency_level}
                    </p>
                )}
            </fieldset>

            <button
                type="submit"
                disabled={
                    processing ||
                    (mode === "existing"
                        ? !data.tech_stack_id
                        : !data.custom_name.trim())
                }
                className="admin-btn-primary admin-btn-lg w-full inline-flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
            >
                <HiOutlinePlus className="w-4 h-4" />
                <span>{processing ? "Adding..." : "Add Skill"}</span>
            </button>
        </form>
    );
}
