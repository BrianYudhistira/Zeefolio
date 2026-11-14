import { useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { HiOutlineCheck, HiOutlineSquares2X2 } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function SkillCategoryDisplayCard({
    categories = [],
    skills = [],
    initialSelectedIds = [],
}) {
    const { data, setData, put, processing, errors } = useForm({
        skill_categories: initialSelectedIds,
    });

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
            className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 sm:p-5 space-y-3.5"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineSquares2X2 className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-semibold text-zinc-100 truncate">
                                Portfolio Display Categories
                            </h2>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Tap categories in order to set display priority (Min 1, Max 4).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={`px-2 sm:px-2.5 py-1 rounded-md border text-[11px] font-mono ${selectedIds.length === 0
                                ? "bg-red-500/10 border-red-500/25 text-red-300"
                                : "bg-zinc-950 border-zinc-800 text-zinc-300"
                            }`}
                    >
                        {selectedIds.length}/4
                        <span className="hidden sm:inline"> Selected</span>
                    </span>
                    <button
                        type="submit"
                        disabled={processing || !hasChanges}
                        className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {processing ? "Saving..." : "Save Display"}
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
                                onClick={() => toggleCategory(cat.id)}
                                disabled={isMaxReached}
                                title={
                                    isMaxReached
                                        ? "Maximum 4 categories selected"
                                        : isSelected
                                            ? "Click to remove from display"
                                            : "Click to add to display"
                                }
                                className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg border text-xs transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${isSelected
                                        ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-medium shadow-sm"
                                        : "bg-zinc-950/70 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100"
                                    }`}
                            >
                                <span className="inline-flex items-center gap-2 min-w-0">
                                    <span
                                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${isSelected
                                                ? "bg-zinc-950 text-zinc-100"
                                                : "bg-zinc-900 border border-zinc-700 text-zinc-500"
                                            }`}
                                    >
                                        {isSelected ? (
                                            `0${orderIndex + 1}`
                                        ) : (
                                            <HiOutlineCheck className="w-2.5 h-2.5 opacity-0" />
                                        )}
                                    </span>
                                    <span className="capitalize truncate">
                                        {cat.name}
                                    </span>
                                </span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${isSelected
                                            ? "bg-zinc-950/15 text-zinc-800"
                                            : "bg-zinc-900 text-zinc-500"
                                        }`}
                                >
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
                className="sm:hidden w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
                {processing ? "Saving..." : "Save Display"}
            </button>

            {errors.skill_categories && (
                <p className="text-xs text-red-400">
                    {errors.skill_categories}
                </p>
            )}
        </form>
    );
}
