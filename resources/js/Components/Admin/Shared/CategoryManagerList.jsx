import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineCheck,
    HiXMark,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";

export default function CategoryManagerList({
    categories = [],
    storeRoute,
    updateRoute,
    onDeleteCategory,
    deletingId = null,
    addLabel = null,
    addInputId = "category-add-name",
    addPlaceholder = "Add new category...",
    addButtonAriaLabel = "Add category",
    emptyMessage = "No categories yet.",
    addSuccessTitle = "Category Added",
    addSuccessMessage = (name) => `Category "${name}" has been added.`,
    renameSuccessTitle = "Category Updated",
    renameSuccessMessage = (name) => `Category renamed to "${name}".`,
    countLabel = (cat) => `${cat.projects_count ?? 0}`,
    badgeText = null,
    showSlug = false,
    capitalizeNames = false,
    selectedCategory = null,
    onSelectCategory = null,
    allCategoriesLabel = "All Categories",
    allCategoriesCount = 0,
    listSurfaceClass = "divide-y divide-zinc-800/80 border-t border-zinc-800 pt-1",
    rowAriaPrefix = "category",
}) {
    const [editingId, setEditingId] = useState(null);
    const [renameError, setRenameError] = useState(null);
    const [savingRename, setSavingRename] = useState(false);

    const addForm = useForm({ name: "" });
    const editForm = useForm({ name: "" });

    const handleAdd = (e) => {
        e.preventDefault();
        const trimmed = addForm.data.name.trim();
        if (!trimmed) return;

        addForm.transform(() => ({ name: trimmed }));
        addForm.post(route(storeRoute), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                addForm.clearErrors();
                notifyAdmin({
                    type: "success",
                    title: addSuccessTitle,
                    message: addSuccessMessage(trimmed),
                });
            },
        });
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setRenameError(null);
        editForm.setData("name", cat.name || "");
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setRenameError(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const saveEdit = (e, cat) => {
        e?.preventDefault();
        if (savingRename) return;

        const trimmed = editForm.data.name.trim();
        if (!trimmed) {
            setRenameError("Category name cannot be empty.");
            return;
        }

        if (trimmed === cat.name) {
            cancelEdit();
            return;
        }

        setSavingRename(true);
        setRenameError(null);

        router.put(
            route(updateRoute, cat.id),
            { name: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEdit();
                    notifyAdmin({
                        type: "success",
                        title: renameSuccessTitle,
                        message: renameSuccessMessage(trimmed),
                    });
                },
                onError: (errors) => {
                    setRenameError(
                        errors?.name || "Failed to rename category."
                    );
                },
                onFinish: () => setSavingRename(false),
            }
        );
    };

    return (
        <div className="space-y-3.5">
            {/* Add Category Form */}
            <form onSubmit={handleAdd} className="space-y-1.5">
                {addLabel && (
                    <label
                        htmlFor={addInputId}
                        className="block text-xs font-medium text-zinc-300"
                    >
                        {addLabel}
                    </label>
                )}
                <div className="flex gap-2">
                    <input
                        id={addInputId}
                        type="text"
                        required
                        maxLength={50}
                        value={addForm.data.name}
                        onChange={(e) => addForm.setData("name", e.target.value)}
                        placeholder={addPlaceholder}
                        aria-label={addLabel || addButtonAriaLabel}
                        aria-invalid={Boolean(addForm.errors.name)}
                        className="admin-input flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={addForm.processing || !addForm.data.name.trim()}
                        title={addButtonAriaLabel}
                        aria-label={addButtonAriaLabel}
                        className="admin-btn-secondary admin-btn-md admin-btn-mobile-icon inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlinePlus className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">
                            {addForm.processing ? "Adding..." : "Add"}
                        </span>
                    </button>
                </div>
                {addForm.errors.name && (
                    <p className="text-xs text-[var(--danger)]">
                        {addForm.errors.name}
                    </p>
                )}
            </form>

            {/* Optional Filter All Row */}
            {onSelectCategory && (
                <div className="pt-1 space-y-1">
                    <button
                        type="button"
                        onClick={() => onSelectCategory("all")}
                        aria-pressed={selectedCategory === "all"}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            selectedCategory === "all"
                                ? "admin-pill-active"
                                : "admin-pill-inactive border-transparent"
                        }`}
                    >
                        <span>{allCategoriesLabel}</span>
                        <span className="text-[var(--text-muted)] tabular-nums">
                            {allCategoriesCount}
                        </span>
                    </button>
                </div>
            )}

            {/* Category Items */}
            <div className={listSurfaceClass}>
                {categories.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-5 text-center">
                        {emptyMessage}
                    </p>
                ) : (
                    categories.map((cat) => {
                        const isEditing = editingId === cat.id;
                        const isSelected =
                            onSelectCategory &&
                            String(selectedCategory) === String(cat.id);

                        return (
                            <div key={cat.id} className="py-2.5 text-xs space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    {isEditing ? (
                                        <form
                                            onSubmit={(e) => saveEdit(e, cat)}
                                            className="flex items-center gap-1.5 flex-1 min-w-0"
                                        >
                                            <input
                                                type="text"
                                                required
                                                maxLength={50}
                                                autoFocus
                                                value={editForm.data.name}
                                                onChange={(e) => {
                                                    editForm.setData(
                                                        "name",
                                                        e.target.value
                                                    );
                                                    if (renameError) {
                                                        setRenameError(null);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Escape") {
                                                        e.preventDefault();
                                                        cancelEdit();
                                                    }
                                                }}
                                                aria-label={`Rename ${cat.name}`}
                                                aria-invalid={Boolean(renameError)}
                                                className="admin-input flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-md border outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={savingRename}
                                                aria-label={`Save rename for ${cat.name}`}
                                                title="Save"
                                                className="admin-icon-btn-sm inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 cursor-pointer disabled:opacity-50"
                                            >
                                                <HiOutlineCheck className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={savingRename}
                                                onClick={cancelEdit}
                                                aria-label="Cancel rename"
                                                title="Cancel"
                                                className="admin-icon-btn-sm inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 cursor-pointer disabled:opacity-50"
                                            >
                                                <HiXMark className="w-3.5 h-3.5" />
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex items-center gap-2 flex-1">
                                                {onSelectCategory ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onSelectCategory(
                                                                isSelected
                                                                    ? "all"
                                                                    : String(cat.id)
                                                            )
                                                        }
                                                        aria-pressed={Boolean(
                                                            isSelected
                                                        )}
                                                        className={`text-left font-medium transition-colors cursor-pointer truncate ${
                                                            capitalizeNames
                                                                ? "capitalize"
                                                                : ""
                                                        } ${
                                                            isSelected
                                                                ? "text-[var(--orange-text)] underline"
                                                                : "text-zinc-300 hover:text-zinc-100"
                                                        }`}
                                                    >
                                                        {cat.name}{" "}
                                                        <span className="text-zinc-500 font-normal">
                                                            ({countLabel(cat)})
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <span
                                                            className={`font-medium text-zinc-200 truncate ${
                                                                capitalizeNames
                                                                    ? "capitalize"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {cat.name}
                                                        </span>
                                                        {showSlug && cat.slug && (
                                                            <span
                                                                title={cat.slug}
                                                                className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 font-mono truncate max-w-[96px] sm:max-w-[120px] shrink-0"
                                                            >
                                                                {cat.slug}
                                                            </span>
                                                        )}
                                                        {badgeText && (
                                                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 shrink-0">
                                                                {badgeText}
                                                            </span>
                                                        )}
                                                        {countLabel && (
                                                            <span className="text-zinc-500 font-normal shrink-0 tabular-nums">
                                                                ({countLabel(cat)})
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(cat)}
                                                    aria-label={`Rename ${rowAriaPrefix} ${cat.name}`}
                                                    title={`Rename ${rowAriaPrefix}`}
                                                    className="admin-icon-btn-sm inline-flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                                                >
                                                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={deletingId === cat.id}
                                                    onClick={() =>
                                                        onDeleteCategory?.(cat)
                                                    }
                                                    aria-label={`Delete ${rowAriaPrefix} ${cat.name}`}
                                                    title={`Delete ${rowAriaPrefix}`}
                                                    className="admin-icon-btn-sm inline-flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {isEditing && renameError && (
                                    <p className="text-[11px] text-[var(--danger)]">
                                        {renameError}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
