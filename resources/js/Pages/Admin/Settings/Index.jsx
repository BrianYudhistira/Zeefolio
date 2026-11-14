import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePlus } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import SkillCategoriesCard from "@/Components/Admin/Settings/SkillCategoriesCard";
import ProjectCategoriesCard from "@/Components/Admin/Settings/ProjectCategoriesCard";
import GlobalSkillsList from "@/Components/Admin/Settings/GlobalSkillsList";
import GlobalSkillModal from "@/Components/Admin/Settings/GlobalSkillModal";

export default function AdminSettingsIndex({
    globalSkills = [],
    categories = [],
    projectCategories = [],
}) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [mobileSection, setMobileSection] = useState("skills");

    // Global Skill Modal State
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);

    // Delete Confirmation Modal State
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'skill' | 'category' | 'project_category', item }
    const [deleting, setDeleting] = useState(false);

    const skillForm = useForm({
        name: "",
        icon: "",
        category_id: "",
    });

    const filteredSkills = globalSkills.filter((skill) => {
        if (
            selectedCategory !== "all" &&
            String(skill.category_id) !== String(selectedCategory)
        ) {
            return false;
        }
        const q = search.toLowerCase();
        return (
            skill.name?.toLowerCase().includes(q) ||
            skill.icon?.toLowerCase().includes(q) ||
            skill.category?.name?.toLowerCase().includes(q)
        );
    });

    const openCreateSkill = () => {
        setEditingSkill(null);
        skillForm.clearErrors();
        skillForm.setData({
            name: "",
            icon: "",
            category_id:
                selectedCategory !== "all" ? String(selectedCategory) : "",
        });
        setSkillModalOpen(true);
    };

    const openEditSkill = (skill) => {
        setEditingSkill(skill);
        skillForm.clearErrors();
        skillForm.setData({
            name: skill.name || "",
            icon: skill.icon || "",
            category_id: skill.category_id || "",
        });
        setSkillModalOpen(true);
    };

    const handleSaveSkill = (e) => {
        e.preventDefault();
        const skillName = skillForm.data.name.trim();

        if (editingSkill) {
            skillForm.put(
                route("admin.settings.skills.update", editingSkill.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSkillModalOpen(false);
                        skillForm.reset();
                        notifyAdmin({
                            type: "success",
                            title: "Global Skill Updated",
                            message: `Global skill "${skillName}" has been updated.`,
                        });
                    },
                }
            );
        } else {
            skillForm.post(route("admin.settings.skills.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setSkillModalOpen(false);
                    skillForm.reset();
                    notifyAdmin({
                        type: "success",
                        title: "Global Skill Added",
                        message: `Global skill "${skillName}" has been added.`,
                    });
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);

        const isCategory = deleteTarget.type === "category";
        const isProjectCategory = deleteTarget.type === "project_category";
        const itemName = deleteTarget.item.name;
        const routeName = isCategory
            ? route("admin.settings.categories.destroy", deleteTarget.item.id)
            : isProjectCategory
              ? route(
                    "admin.settings.project-categories.destroy",
                    deleteTarget.item.id
                )
              : route("admin.settings.skills.destroy", deleteTarget.item.id);

        router.delete(routeName, {
            preserveScroll: true,
            onSuccess: () => {
                if (
                    isCategory &&
                    String(selectedCategory) === String(deleteTarget.item.id)
                ) {
                    setSelectedCategory("all");
                }
                setDeleteTarget(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: isCategory
                        ? `Skill category "${itemName}" has been deleted.`
                        : isProjectCategory
                          ? `Project category "${itemName}" has been deleted.`
                          : `Global skill "${itemName}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    const deleteModalTitle =
        deleteTarget?.type === "category"
            ? "Delete Skill Category"
            : deleteTarget?.type === "project_category"
              ? "Delete Project Category"
              : "Delete Global Skill";

    return (
        <AdminLayout
            title="Settings"
            headerActions={
                <button
                    type="button"
                    onClick={openCreateSkill}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors cursor-pointer"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span className="sm:hidden">Add Skill</span>
                    <span className="hidden sm:inline">Add Global Skill</span>
                </button>
            }
        >
            <Head title="Admin Settings - Zeefolio" />

            <div className="space-y-4 sm:space-y-6">
                {/* Summary Banner */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                                Admin Configuration
                            </span>
                            <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                Global Skills & Categories
                            </h2>
                        </div>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-1">
                            Configure the default global skills and skill categories available to all members across the platform.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Skills
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                                {globalSkills.length}
                            </p>
                        </div>
                        <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Skill Cats
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                                {categories.length}
                            </p>
                        </div>
                        <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Project Cats
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                                {projectCategories.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Section Switcher (< lg) */}
                <div className="lg:hidden grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setMobileSection("skills")}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            mobileSection === "skills"
                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                        }`}
                    >
                        Global Skills ({globalSkills.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileSection("categories")}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            mobileSection === "categories"
                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                        }`}
                    >
                        Categories (
                        {categories.length + projectCategories.length})
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    {/* Left Column: Global Skill & Project Categories */}
                    <div
                        className={`lg:col-span-4 space-y-5 ${
                            mobileSection === "categories"
                                ? "block"
                                : "hidden lg:block"
                        }`}
                    >
                        <SkillCategoriesCard
                            categories={categories}
                            globalSkillsCount={globalSkills.length}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            onDeleteCategory={(cat) =>
                                setDeleteTarget({
                                    type: "category",
                                    item: cat,
                                })
                            }
                        />

                        <ProjectCategoriesCard
                            projectCategories={projectCategories}
                            onDeleteProjectCategory={(cat) =>
                                setDeleteTarget({
                                    type: "project_category",
                                    item: cat,
                                })
                            }
                        />
                    </div>

                    {/* Right Column: Global Default Skills List */}
                    <div
                        className={`lg:col-span-8 ${
                            mobileSection === "skills"
                                ? "block"
                                : "hidden lg:block"
                        }`}
                    >
                        <GlobalSkillsList
                            filteredSkills={filteredSkills}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            search={search}
                            onSearchChange={setSearch}
                            onEditSkill={openEditSkill}
                            onDeleteSkill={(skill) =>
                                setDeleteTarget({
                                    type: "skill",
                                    item: skill,
                                })
                            }
                        />
                    </div>
                </div>
            </div>

            <GlobalSkillModal
                open={skillModalOpen}
                editingSkill={editingSkill}
                skillForm={skillForm}
                categories={categories}
                onClose={() => setSkillModalOpen(false)}
                onSubmit={handleSaveSkill}
            />

            <ConfirmDeleteModal
                open={Boolean(deleteTarget)}
                title={deleteModalTitle}
                itemName={deleteTarget?.item?.name}
                processing={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </AdminLayout>
    );
}
