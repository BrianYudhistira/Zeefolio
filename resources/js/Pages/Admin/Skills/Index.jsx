import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminModal from "@/Components/UI/AdminModal";
import MobileFab from "@/Components/Admin/MobileFab";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import SkillRowItem from "@/Components/Admin/Skills/SkillRowItem";
import SkillFormModal from "@/Components/Admin/Skills/SkillFormModal";
import SkillCategoryDisplayCard from "@/Components/Admin/Skills/SkillCategoryDisplayCard";
import CustomCategoryModal from "@/Components/Admin/Shared/CustomCategoryModal";

export default function SkillsIndex({
    skills = [],
    techStacks = [],
    categories = [],
    selectedCategoryIds = [],
}) {
    const [search, setSearch] = useState("");
    const [mobileAddOpen, setMobileAddOpen] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [updatingSkillId, setUpdatingSkillId] = useState(null);
    const [formResetKey, setFormResetKey] = useState(0);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const globalCategories = categories.filter((c) => c.is_global);
    const customCategories = categories.filter((c) => !c.is_global);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            mode: "existing",
            tech_stack_id: "",
            custom_name: "",
            category_id: "",
            custom_category: "",
            icon: "",
            proficiency_level: 4,
        });

    const switchMode = (newMode) => {
        clearErrors();
        setData("mode", newMode);
    };

    const existingTechIds = new Set(skills.map((s) => s.tech_stack_id));
    const availableTechStacks = techStacks.filter(
        (ts) => !existingTechIds.has(ts.id)
    );

    const filteredSkills = skills.filter((item) => {
        const q = search.toLowerCase();
        const name = item.tech_stack?.name?.toLowerCase() || "";
        const cat = item.tech_stack?.category?.name?.toLowerCase() || "";
        return name.includes(q) || cat.includes(q);
    });

    const handleAdd = (e) => {
        e.preventDefault();
        post(route("admin.skills.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset(
                    "tech_stack_id",
                    "custom_name",
                    "icon",
                    "category_id",
                    "custom_category"
                );
                setFormResetKey((prev) => prev + 1);
                setMobileAddOpen(false);
            },
        });
    };

    const handleLevelChange = (skill, newLevel) => {
        if (skill.proficiency_level === newLevel) return;
        if (updatingSkillId === skill.id) return;

        setUpdatingSkillId(skill.id);
        router.put(
            route("admin.skills.update", skill.id),
            { proficiency_level: newLevel },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingSkillId(null),
            }
        );
    };

    const confirmDelete = () => {
        if (!skillToDelete) return;
        setDeleting(true);

        router.delete(route("admin.skills.destroy", skillToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSkillToDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title="Skills" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start pb-20 lg:pb-0">
                <div className="hidden lg:block lg:col-span-4">
                    <SkillFormModal
                        mode={data.mode}
                        onSwitchMode={switchMode}
                        availableTechStacks={availableTechStacks}
                        categories={categories}
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        resetKey={formResetKey}
                        onSubmit={handleAdd}
                    />
                </div>

                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                    <SkillCategoryDisplayCard
                        categories={categories}
                        skills={skills}
                        initialSelectedIds={selectedCategoryIds}
                        onManageCategories={() => setCategoryModalOpen(true)}
                    />

                    <div className="admin-card rounded-xl border overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-zinc-100">
                                Your Skills ({filteredSkills.length})
                            </h2>
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search your skills..."
                            />
                        </div>

                        {filteredSkills.length === 0 ? (
                            <EmptyState
                                message={
                                    search
                                        ? "No skills match your search."
                                        : "No skills added yet."
                                }
                                actionLabel={search ? "Clear Search" : null}
                                onAction={search ? () => setSearch("") : null}
                            />
                        ) : (
                            <div className="divide-y divide-zinc-800">
                                {filteredSkills.map((skill) => (
                                    <SkillRowItem
                                        key={skill.id}
                                        skill={skill}
                                        updating={updatingSkillId === skill.id}
                                        onLevelChange={handleLevelChange}
                                        onDelete={setSkillToDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MobileFab
                onClick={() => {
                    clearErrors();
                    setMobileAddOpen(true);
                }}
                label="Add Skill"
                hideAbove="lg"
            />

            <AdminModal
                open={mobileAddOpen}
                onClose={() => setMobileAddOpen(false)}
                mobileSheet
                showCloseButton={false}
                maxWidthClass="sm:max-w-md"
                preventClose={processing}
            >
                <SkillFormModal
                    mode={data.mode}
                    onSwitchMode={switchMode}
                    availableTechStacks={availableTechStacks}
                    categories={categories}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    resetKey={formResetKey}
                    onSubmit={handleAdd}
                    onClose={() => !processing && setMobileAddOpen(false)}
                />
            </AdminModal>

            <ConfirmDeleteModal
                open={Boolean(skillToDelete)}
                title="Remove Skill"
                description={
                    skillToDelete ? (
                        <>
                            Are you sure you want to remove{" "}
                            <span className="text-zinc-200 font-medium">
                                {skillToDelete.tech_stack?.name}
                            </span>{" "}
                            from your active skills?
                        </>
                    ) : null
                }
                confirmLabel="Remove Skill"
                processing={deleting}
                onClose={() => setSkillToDelete(null)}
                onConfirm={confirmDelete}
            />

            <CustomCategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                globalCategories={globalCategories}
                customCategories={customCategories}
                title="Manage Skill Categories"
                subtitle="Create, rename, or remove your custom categories."
                inputLabel="Add New Category"
                placeholder="e.g. Design, Marketing, Tools"
                customListLabel="Your Custom Categories"
                emptyMessage="You haven't created any custom categories yet."
                storeRoute="admin.skills.custom-categories.store"
                updateRoute="admin.skills.custom-categories.update"
                destroyRoute="admin.skills.custom-categories.destroy"
                capitalizeNames
                onCategoryDeleted={(cat) => {
                    if (String(data.category_id) === String(cat.id)) {
                        setData("category_id", "");
                    }
                }}
            />
        </>
    );
}

SkillsIndex.layout = (page) => <AdminLayout title="Skills">{page}</AdminLayout>;
