import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineCheck,
    HiXMark,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function CustomCategoryModal({
    open,
    onClose,
    globalCategories = [],
    customCategories = [],
    onCategoryDeleted,
}) {
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatName, setEditingCatName] = useState("");
    const [deletingCatId, setDeletingCatId] = useState(null);

    const catForm = useForm({
        name: "",
    });

    if (!open) return null;

    const handleAddCustomCategory = (e) => {
        e.preventDefault();
        const catName = catForm.data.name.trim();
        if (!catName) return;

        catForm.post(route("admin.projects.categories.store"), {
            preserveScroll: true,
            onSuccess: () => {
                catForm.reset();
                notifyAdmin({
                    type: "success",
                    title: "Custom Category Added",
                    message: `Category "${catName}" has been added.`,
                });
            },
        });
    };

    const saveEditCustomCategory = (cat) => {
        const trimmed = editingCatName.trim();
        if (!trimmed) return;

        router.put(
            route("admin.projects.categories.update", cat.id),
            { name: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCatId(null);
                    setEditingCatName("");
                    notifyAdmin({
                        type: "success",
                        title: "Category Updated",
                        message: `Custom category renamed to "${trimmed}".`,
                    });
                },
            }
        );
    };

    const deleteCustomCategory = (cat) => {
        setDeletingCatId(cat.id);
        router.delete(route("admin.projects.categories.destroy", cat.id), {
            preserveScroll: true,
            onSuccess: () => {
                onCategoryDeleted?.(cat);
                setDeletingCatId(null);
                notifyAdmin({
                    type: "success",
                    title: "Category Deleted",
                    message: `Custom category "${cat.name}" has been deleted.`,
                });
            },
            onFinish: () => setDeletingCatId(null),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                            Project Categories
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Create and manage your custom project categories.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-5">
                    {/* Add Custom Category Form */}
                    <form
                        onSubmit={handleAddCustomCategory}
                        className="space-y-1.5"
                    >
                        <label className="block text-xs font-medium text-zinc-300">
                            Add Custom Category
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={catForm.data.name}
                                onChange={(e) =>
                                    catForm.setData("name", e.target.value)
                                }
                                placeholder="e.g. AI / Machine Learning, Desktop App"
                                className="flex-1 text-xs px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={catForm.processing}
                                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-100 transition-colors cursor-pointer shrink-0"
                            >
                                {catForm.processing ? "Adding..." : "Add"}
                            </button>
                        </div>
                        {catForm.errors.name && (
                            <p className="text-xs text-red-400">
                                {catForm.errors.name}
                            </p>
                        )}
                    </form>

                    {/* Custom Categories List */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                            My Custom Categories ({customCategories.length})
                        </p>
                        {customCategories.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-4 text-center rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                                You haven&apos;t added any custom categories yet.
                            </p>
                        ) : (
                            <div className="divide-y divide-zinc-800 rounded-lg bg-zinc-950 border border-zinc-800 px-3">
                                {customCategories.map((cat) => {
                                    const isEditing = editingCatId === cat.id;
                                    return (
                                        <div
                                            key={cat.id}
                                            className="py-2.5 flex items-center justify-between gap-2 text-xs"
                                        >
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingCatName}
                                                        onChange={(e) =>
                                                            setEditingCatName(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1 text-xs px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            saveEditCustomCategory(
                                                                cat
                                                            )
                                                        }
                                                        className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 cursor-pointer"
                                                        title="Save"
                                                    >
                                                        <HiOutlineCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingCatId(
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
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="font-medium text-zinc-200 truncate">
                                                            {cat.name}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
                                                            Custom
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCatId(
                                                                    cat.id
                                                                );
                                                                setEditingCatName(
                                                                    cat.name
                                                                );
                                                            }}
                                                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                                                            title="Rename custom category"
                                                        >
                                                            <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingCatId ===
                                                                cat.id
                                                            }
                                                            onClick={() =>
                                                                deleteCustomCategory(
                                                                    cat
                                                                )
                                                            }
                                                            className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Delete custom category"
                                                        >
                                                            <HiOutlineTrash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Global Categories Reference */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                            Global Categories ({globalCategories.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {globalCategories.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300"
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-emerald-400">
                                        Global
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
