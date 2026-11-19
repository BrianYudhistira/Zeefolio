import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminModal from "@/Components/UI/AdminModal";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import CategoryManagerList from "@/Components/Admin/Shared/CategoryManagerList";

export default function CustomCategoryModal({
    open,
    onClose,
    globalCategories = [],
    customCategories = [],
    onCategoryDeleted,
    title = "Project Categories",
    subtitle = "Create and manage your custom project categories.",
    inputLabel = "Add Custom Category",
    placeholder = "e.g. AI / Machine Learning, Desktop App",
    customListLabel = "My Custom Categories",
    emptyMessage = "You haven't added any custom categories yet.",
    storeRoute = "admin.projects.categories.store",
    updateRoute = "admin.projects.categories.update",
    destroyRoute = "admin.projects.categories.destroy",
    capitalizeNames = false,
}) {
    const [deletingCatId, setDeletingCatId] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const confirmDeleteCustomCategory = () => {
        if (!categoryToDelete) return;
        const target = categoryToDelete;
        setDeletingCatId(target.id);

        router.delete(route(destroyRoute, target.id), {
            preserveScroll: true,
            onSuccess: () => {
                onCategoryDeleted?.(target);
                setCategoryToDelete(null);
            },
            onFinish: () => setDeletingCatId(null),
        });
    };

    return (
        <>
            <AdminModal
                open={open}
                onClose={onClose}
                title={title}
                subtitle={subtitle}
                maxWidthClass="max-w-md"
                preventClose={Boolean(deletingCatId)}
            >
                <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
                    <div className="space-y-2">
                        <CategoryManagerList
                            categories={customCategories}
                            storeRoute={storeRoute}
                            updateRoute={updateRoute}
                            onDeleteCategory={(cat) =>
                                setCategoryToDelete(cat)
                            }
                            deletingId={deletingCatId}
                            addLabel={inputLabel}
                            addInputId="custom-category-name"
                            addPlaceholder={placeholder}
                            addButtonAriaLabel="Add category"
                            emptyMessage={emptyMessage}
                            countLabel={null}
                            badgeText="Custom"
                            capitalizeNames={capitalizeNames}
                            rowAriaPrefix="custom category"
                            listSurfaceClass="divide-y divide-zinc-800 rounded-lg bg-zinc-950 border border-zinc-800 px-3"
                        />
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 pt-1">
                            {customListLabel} ({customCategories.length})
                        </p>
                    </div>

                    {/* Default Categories Reference */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                            Default Categories ({globalCategories.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {globalCategories.map((cat) => (
                                <span
                                    key={cat.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 ${capitalizeNames ? "capitalize" : ""}`}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-[10px] text-emerald-400 normal-case">
                                        Default
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </AdminModal>

            <ConfirmDeleteModal
                open={Boolean(categoryToDelete)}
                title="Delete Custom Category"
                itemName={categoryToDelete?.name}
                processing={deletingCatId === categoryToDelete?.id}
                onClose={() => !deletingCatId && setCategoryToDelete(null)}
                onConfirm={confirmDeleteCustomCategory}
            />
        </>
    );
}
