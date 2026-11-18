import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineTag,
    HiOutlineCheck,
    HiXMark,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function SkillCategoriesCard({
    categories = [],
    globalSkillsCount = 0,
    selectedCategory = "all",
    onSelectCategory,
    onDeleteCategory,
}) {
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");

    const catForm = useForm({
        name: "",
    });

    const handleAddCategory = (e) => {
        e.preventDefault();
        const catName = catForm.data.name.trim();
        catForm.post(route("admin.settings.categories.store"), {
            preserveScroll: true,
            onSuccess: () => {
                catForm.reset();
                notifyAdmin({
                    type: "success",
                    title: "Category Added",
                    message: `Category "${catName}" has been added.`,
                });
            },
        });
    };

    const startEditCategory = (cat) => {
        setEditingCategoryId(cat.id);
        setEditingCategoryName(cat.name);
    };

    const saveEditCategory = (cat) => {
        const trimmed = editingCategoryName.trim();
        if (!trimmed) return;

        router.put(
            route("admin.settings.categories.update", cat.id),
            { name: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCategoryId(null);
                    setEditingCategoryName("");
                    notifyAdmin({
                        type: "success",
                        title: "Category Updated",
                        message: `Category renamed to "${trimmed}".`,
                    });
                },
            }
        );
    };

    return (
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <HiOutlineTag className="w-4 h-4 text-zinc-400" />
                        <span>Skill Categories (Default)</span>
                    </h3>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Manage primary categories used to group skills.
                    </p>
                </div>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                    type="text"
                    required
                    value={catForm.data.name}
                    onChange={(e) => catForm.setData("name", e.target.value)}
                    placeholder="Add new category..."
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={catForm.processing}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-100 transition-colors cursor-pointer shrink-0"
                >
                    Add
                </button>
            </form>
            {catForm.errors.name && (
                <p className="text-xs text-red-400">{catForm.errors.name}</p>
            )}

            {/* Category Filter All Button */}
            <div className="pt-1 space-y-1">
                <button
                    type="button"
                    onClick={() => onSelectCategory("all")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategory === "all"
                            ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                    }`}
                >
                    <span>All Categories</span>
                    <span className="text-zinc-500">{globalSkillsCount}</span>
                </button>
            </div>

            {/* Categories List */}
            <div className="divide-y divide-zinc-800/80 border-t border-zinc-800 pt-1">
                {categories.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                        No skill categories yet.
                    </p>
                ) : (
                    categories.map((cat) => {
                        const isSelected =
                            String(selectedCategory) === String(cat.id);
                        const isEditing = editingCategoryId === cat.id;

                        return (
                            <div
                                key={cat.id}
                                className="py-2.5 flex items-center justify-between gap-2 text-xs"
                            >
                                {isEditing ? (
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <input
                                            type="text"
                                            value={editingCategoryName}
                                            onChange={(e) =>
                                                setEditingCategoryName(
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 text-xs px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveEditCategory(cat)
                                            }
                                            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 cursor-pointer"
                                            title="Save"
                                        >
                                            <HiOutlineCheck className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingCategoryId(null)
                                            }
                                            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 cursor-pointer"
                                            title="Cancel"
                                        >
                                            <HiXMark className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectCategory(
                                                    isSelected
                                                        ? "all"
                                                        : String(cat.id)
                                                )
                                            }
                                            className={`text-left font-medium transition-colors cursor-pointer capitalize truncate ${
                                                isSelected
                                                    ? "text-zinc-100 underline"
                                                    : "text-zinc-300 hover:text-zinc-100"
                                            }`}
                                        >
                                            {cat.name}{" "}
                                            <span className="text-zinc-500 font-normal">
                                                ({cat.global_skills_count ?? 0}{" "}
                                                default)
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditCategory(cat)
                                                }
                                                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                                                title="Rename category"
                                            >
                                                <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDeleteCategory(cat)
                                                }
                                                className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Delete category"
                                            >
                                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
