import { HiOutlineFolder } from "react-icons/hi2";
import CategoryManagerList from "@/Components/Admin/Shared/CategoryManagerList";

export default function ProjectCategoriesCard({
    projectCategories = [],
    onDeleteProjectCategory,
}) {
    return (
        <div className="admin-card rounded-xl border p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <HiOutlineFolder className="w-4 h-4 text-[var(--orange-text)]" />
                        <span>Project Categories (Default)</span>
                    </h3>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Default project categories available to all users when creating projects.
                    </p>
                </div>
            </div>

            <CategoryManagerList
                categories={projectCategories}
                storeRoute="admin.settings.project-categories.store"
                updateRoute="admin.settings.project-categories.update"
                onDeleteCategory={onDeleteProjectCategory}
                addInputId="project-category-add-name"
                addPlaceholder="New project category..."
                addButtonAriaLabel="Add project category"
                emptyMessage="No project categories yet."
                showSlug
                countLabel={(cat) => `${cat.projects_count ?? 0} projects`}
                rowAriaPrefix="project category"
            />
        </div>
    );
}
