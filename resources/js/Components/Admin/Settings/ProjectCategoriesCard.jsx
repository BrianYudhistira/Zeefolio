import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineFolder,
    HiOutlineCheck,
    HiXMark,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function ProjectCategoriesCard({
    projectCategories = [],
    onDeleteProjectCategory,
}) {
    const [editingProjectCategoryId, setEditingProjectCategoryId] =
        useState(null);
    const [editingProjectCategoryName, setEditingProjectCategoryName] =
        useState("");

    const projectCatForm = useForm({
        name: "",
    });

    const handleAddProjectCategory = (e) => {
        e.preventDefault();
        const catName = projectCatForm.data.name.trim();
        projectCatForm.post(route("admin.settings.project-categories.store"), {
            preserveScroll: true,
            onSuccess: () => {
                projectCatForm.reset();
                notifyAdmin({
                    type: "success",
                    title: "Project Category Added",
                    message: `Global project category "${catName}" has been added.`,
                });
            },
        });
    };

    const startEditProjectCategory = (cat) => {
        setEditingProjectCategoryId(cat.id);
        setEditingProjectCategoryName(cat.name);
    };

    const saveEditProjectCategory = (cat) => {
        const trimmed = editingProjectCategoryName.trim();
        if (!trimmed) return;

        router.put(
            route("admin.settings.project-categories.update", cat.id),
            { name: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingProjectCategoryId(null);
                    setEditingProjectCategoryName("");
                    notifyAdmin({
                        type: "success",
                        title: "Project Category Updated",
                        message: `Project category renamed to "${trimmed}".`,
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
                        <HiOutlineFolder className="w-4 h-4 text-zinc-400" />
                        <span>Project Categories (Global)</span>
                    </h3>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Default project categories available to all users when creating projects.
                    </p>
                </div>
            </div>

            {/* Add Project Category Form */}
            <form onSubmit={handleAddProjectCategory} className="flex gap-2">
                <input
                    type="text"
                    required
                    value={projectCatForm.data.name}
                    onChange={(e) =>
                        projectCatForm.setData("name", e.target.value)
                    }
                    placeholder="Add project category (e.g. AI / ML, UI/UX)..."
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={projectCatForm.processing}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-100 transition-colors cursor-pointer shrink-0"
                >
                    Add
                </button>
            </form>
            {projectCatForm.errors.name && (
                <p className="text-xs text-red-400">
                    {projectCatForm.errors.name}
                </p>
            )}

            {/* Project Categories List */}
            <div className="divide-y divide-zinc-800/80 border-t border-zinc-800 pt-1">
                {projectCategories.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                        No global project categories yet.
                    </p>
                ) : (
                    projectCategories.map((cat) => {
                        const isEditing = editingProjectCategoryId === cat.id;

                        return (
                            <div
                                key={cat.id}
                                className="py-2.5 flex items-center justify-between gap-2 text-xs"
                            >
                                {isEditing ? (
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <input
                                            type="text"
                                            value={editingProjectCategoryName}
                                            onChange={(e) =>
                                                setEditingProjectCategoryName(
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 text-xs px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveEditProjectCategory(cat)
                                            }
                                            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 cursor-pointer"
                                            title="Save"
                                        >
                                            <HiOutlineCheck className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingProjectCategoryId(
                                                    null
                                                )
                                            }
                                            className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 cursor-pointer"
                                            title="Cancel"
                                        >
                                            <HiXMark className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="min-w-0 flex items-center gap-2">
                                            <span className="font-medium text-zinc-200 truncate">
                                                {cat.name}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                                                {cat.slug}
                                            </span>
                                            <span className="text-zinc-500 font-normal shrink-0">
                                                ({cat.projects_count ?? 0}{" "}
                                                projects)
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditProjectCategory(
                                                        cat
                                                    )
                                                }
                                                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                                                title="Rename project category"
                                            >
                                                <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDeleteProjectCategory(cat)
                                                }
                                                className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Delete project category"
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
