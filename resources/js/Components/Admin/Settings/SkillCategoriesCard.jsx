import { HiOutlineTag } from "react-icons/hi2";
import CategoryManagerList from "@/Components/Admin/Shared/CategoryManagerList";

export default function SkillCategoriesCard({
    categories = [],
    globalSkillsCount = 0,
    selectedCategory = "all",
    onSelectCategory,
    onDeleteCategory,
}) {
    return (
        <div className="admin-card rounded-xl border p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <HiOutlineTag className="w-4 h-4 text-[var(--indigo)]" />
                        <span>Skill Categories (Default)</span>
                    </h3>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Manage primary categories used to group skills.
                    </p>
                </div>
            </div>

            <CategoryManagerList
                categories={categories}
                storeRoute="admin.settings.categories.store"
                updateRoute="admin.settings.categories.update"
                onDeleteCategory={onDeleteCategory}
                addInputId="skill-category-add-name"
                addPlaceholder="New skill category..."
                addButtonAriaLabel="Add skill category"
                emptyMessage="No skill categories yet."
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                allCategoriesLabel="All Categories"
                allCategoriesCount={globalSkillsCount}
                countLabel={(cat) => `${cat.global_skills_count ?? 0} default`}
                capitalizeNames
                rowAriaPrefix="skill category"
            />
        </div>
    );
}
