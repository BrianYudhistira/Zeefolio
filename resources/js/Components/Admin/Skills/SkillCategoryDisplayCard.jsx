import { useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import {
    HiOutlinePlus,
    HiOutlineSquares2X2,
    HiOutlineTag,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function SkillCategoryDisplayCard({
    categories = [],
    skills = [],
    initialSelectedIds = [],
    onManageCategories,
}) {
    const { data, setData, put, processing, errors } = useForm({
        skill_categories: initialSelectedIds,
    });

    useEffect(() => {
        setData("skill_categories", initialSelectedIds);
    }, [JSON.stringify(initialSelectedIds)]);

    const skillCountsByCategory = useMemo(() => {
        const counts = new Map();
        skills.forEach((skill) => {
            const catId = skill?.tech_stack?.category_id;
            if (catId) {
                counts.set(catId, (counts.get(catId) || 0) + 1);
            }
        });
        return counts;
    }, [skills]);

    const selectedIds = Array.isArray(data.skill_categories)
        ? data.skill_categories
        : [];

    const hasChanges =
        JSON.stringify(selectedIds) !== JSON.stringify(initialSelectedIds);

    const toggleCategory = (categoryId) => {
        const isSelected = selectedIds.includes(categoryId);

        if (isSelected) {
            setData(
                "skill_categories",
                selectedIds.filter((id) => id !== categoryId)
            );
            return;
        }

        if (selectedIds.length >= 4) {
            notifyAdmin({
                type: "error",
                title: "Maximum 4 Categories",
                message:
                    "You can display up to 4 skill categories on your portfolio.",
            });
            return;
        }

        setData("skill_categories", [...selectedIds, categoryId]);
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (selectedIds.length < 1) {
            notifyAdmin({
                type: "error",
                title: "No Category Selected",
                message:
                    "Please select at least 1 skill category to display on your portfolio.",
            });
            return;
        }

        put(route("admin.skills.categories.update"), {
            preserveScroll: true,
            onSuccess: () => {
                notifyAdmin({
                    type: "success",
                    title: "Display Updated",
                    message:
                        "Portfolio skill categories display settings have been saved.",
                });
            },
        });
    };

    return (
        <form
            onSubmit={handleSave}
            className="admin-card rounded-xl border p-3.5 sm:p-5 space-y-4"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg admin-well border flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineSquares2X2 className="w-4 h-4 text-[var(--orange-text)]" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-zinc-100 truncate">
                            Categories Shown on Profile
                        </h2>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Pick 1 to 4 categories to highlight on your public page (tap in order).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={`h-8 px-2.5 rounded-lg border inline-flex items-center gap-1.5 text-[11px] ${selectedIds.length === 0
                                ? "bg-red-500/10 border-red-500/25 text-red-300"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400"
                            }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedIds.length === 0
                                    ? "bg-[var(--danger)]"
                                    : "bg-[var(--emerald)]"
                                }`}
                        />
                        <span className="font-mono font-semibold text-zinc-100">
                            {selectedIds.length}/4
                        </span>
                        <span className="hidden sm:inline">Selected</span>
                    </span>
                    {onManageCategories && (
                        <button
                            type="button"
                            onClick={onManageCategories}
                            className="admin-btn-secondary h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                            title="Add, rename, or delete custom categories"
                        >
                            <HiOutlineTag className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="hidden sm:inline">Manage</span>
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing || !hasChanges}
                        className={`hidden sm:inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium transition-colors ${hasChanges || processing
                                ? "admin-btn-primary cursor-pointer"
                                : "admin-btn-ghost opacity-55 cursor-not-allowed"
                            }`}
                    >
                        {processing ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {/* Category Chips: 2-column grid on mobile, flex-wrap on desktop */}
            {categories.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">
                    No skill categories available yet.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {categories.map((cat) => {
                        const orderIndex = selectedIds.indexOf(cat.id);
                        const isSelected = orderIndex !== -1;
                        const count = skillCountsByCategory.get(cat.id) || 0;
                        const isMaxReached =
                            !isSelected && selectedIds.length >= 4;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                data-selected={isSelected}
                                onClick={() => toggleCategory(cat.id)}
                                disabled={isMaxReached}
                                title={
                                    isMaxReached
                                        ? "Maximum 4 categories selected"
                                        : isSelected
                                            ? "Click to remove from display"
                                            : "Click to add to display"
                                }
                                className={`admin-cat-chip w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 px-2.5 sm:px-3 py-2 rounded-lg border text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${isSelected ? "font-medium" : ""
                                    }`}
                            >
                                <span className="inline-flex items-center gap-2 min-w-0">
                                    <span className="admin-cat-chip-order h-5 min-w-[1.375rem] px-1 rounded flex items-center justify-center text-[10px] font-mono font-semibold shrink-0 transition-colors">
                                        {isSelected ? (
                                            `0${orderIndex + 1}`
                                        ) : (
                                            <HiOutlinePlus className="w-3 h-3 opacity-60" />
                                        )}
                                    </span>
                                    <span className="capitalize truncate">
                                        {cat.name}
                                    </span>
                                </span>
                                <span className="admin-cat-chip-count text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 transition-colors">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Mobile Save Button */}
            <button
                type="submit"
                disabled={processing || !hasChanges}
                className={`sm:hidden w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${hasChanges || processing
                        ? "admin-btn-primary cursor-pointer"
                        : "admin-btn-ghost opacity-55 cursor-not-allowed"
                    }`}
            >
                {processing ? "Saving..." : "Save"}
            </button>

            {errors.skill_categories && (
                <p className="text-xs text-red-400">
                    {errors.skill_categories}
                </p>
            )}
        </form>
    );
}
