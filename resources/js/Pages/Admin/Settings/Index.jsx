import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import MobileFab from "@/Components/Admin/MobileFab";
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
    const [activeGroupFocus, setActiveGroupFocus] = useState("skill");

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

        if (editingSkill) {
            skillForm.put(
                route("admin.settings.skills.update", editingSkill.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSkillModalOpen(false);
                        skillForm.reset();
                    },
                }
            );
        } else {
            skillForm.post(route("admin.settings.skills.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setSkillModalOpen(false);
                    skillForm.reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);

        const isCategory = deleteTarget.type === "category";
        const isProjectCategory = deleteTarget.type === "project_category";
        const deletedId = deleteTarget.item.id;
        const routeName = isCategory
            ? route("admin.settings.categories.destroy", deletedId)
            : isProjectCategory
              ? route("admin.settings.project-categories.destroy", deletedId)
              : route("admin.settings.skills.destroy", deletedId);

        router.delete(routeName, {
            preserveScroll: true,
            onSuccess: () => {
                if (
                    isCategory &&
                    String(selectedCategory) === String(deletedId)
                ) {
                    setSelectedCategory("all");
                }
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const deleteModalTitle =
        deleteTarget?.type === "category"
            ? "Delete Skill Category"
            : deleteTarget?.type === "project_category"
              ? "Delete Project Category"
              : "Delete Default Skill";

    const scrollToSection = (elementId) => {
        requestAnimationFrame(() => {
            document.getElementById(elementId)?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        });
    };

    const handleSelectSkillCategory = (categoryId) => {
        setSelectedCategory(categoryId);
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setMobileSection("skills");
            scrollToSection("settings-skills-list");
        }
    };

    const isSkillsCardActive =
        mobileSection === "skills" && selectedCategory === "all";
    const isSkillGroupsActive =
        (mobileSection === "categories" && activeGroupFocus === "skill") ||
        selectedCategory !== "all";
    const isProjectGroupsActive =
        mobileSection === "categories" && activeGroupFocus === "project";

    return (
        <>
            <Head title="Admin Settings" />

            <div
                className={`space-y-4 sm:space-y-6 ${
                    mobileSection === "skills" ? "pb-20 sm:pb-0" : ""
                }`}
            >
                {/* Summary Banner */}
                <div className="admin-card rounded-xl border p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                                Shared Defaults
                            </span>
                            <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                Default Skills & Categories
                            </h2>
                        </div>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-1">
                            Configure the default skills and skill categories available to all members across the platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory("all");
                                setMobileSection("skills");
                                scrollToSection("settings-skills-list");
                            }}
                            data-active={isSkillsCardActive ? "true" : "false"}
                            aria-pressed={isSkillsCardActive}
                            title="Show all default skills"
                            style={{ "--accent": "var(--orange)" }}
                            className="admin-well admin-well-btn px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-center cursor-pointer active:scale-[0.98]"
                        >
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Skills
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100 tabular-nums">
                                {globalSkills.length}
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveGroupFocus("skill");
                                setMobileSection("categories");
                                scrollToSection("settings-skill-categories");
                            }}
                            data-active={isSkillGroupsActive ? "true" : "false"}
                            aria-pressed={isSkillGroupsActive}
                            title="Jump to skill categories"
                            style={{ "--accent": "var(--indigo)" }}
                            className="admin-well admin-well-btn px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-center cursor-pointer active:scale-[0.98]"
                        >
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Skill Groups
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100 tabular-nums">
                                {categories.length}
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveGroupFocus("project");
                                setMobileSection("categories");
                                scrollToSection("settings-project-categories");
                            }}
                            data-active={isProjectGroupsActive ? "true" : "false"}
                            aria-pressed={isProjectGroupsActive}
                            title="Jump to project categories"
                            style={{ "--accent": "var(--emerald)" }}
                            className="admin-well admin-well-btn px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-center cursor-pointer active:scale-[0.98]"
                        >
                            <p className="text-[10px] sm:text-[11px] text-zinc-500">
                                Project Groups
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100 tabular-nums">
                                {projectCategories.length}
                            </p>
                        </button>
                    </div>
                </div>

                {/* Mobile Section Switcher (< lg) */}
                <div
                    role="tablist"
                    aria-label="Settings views"
                    className="lg:hidden admin-pill-track grid grid-cols-2 gap-1 p-1 rounded-xl border"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileSection === "skills"}
                        onClick={() => setMobileSection("skills")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            mobileSection === "skills"
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
                        }`}
                    >
                        Default Skills ({globalSkills.length})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileSection === "categories"}
                        onClick={() => setMobileSection("categories")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            mobileSection === "categories"
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
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
                        <div
                            id="settings-skill-categories"
                            className="scroll-mt-20"
                        >
                            <SkillCategoriesCard
                                categories={categories}
                                globalSkillsCount={globalSkills.length}
                                selectedCategory={selectedCategory}
                                onSelectCategory={handleSelectSkillCategory}
                                onDeleteCategory={(cat) =>
                                    setDeleteTarget({
                                        type: "category",
                                        item: cat,
                                    })
                                }
                            />
                        </div>

                        <div
                            id="settings-project-categories"
                            className="scroll-mt-20"
                        >
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
                    </div>

                    {/* Right Column: Global Default Skills List */}
                    <div
                        id="settings-skills-list"
                        className={`lg:col-span-8 scroll-mt-20 ${
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
                            onCreateSkill={openCreateSkill}
                        />
                    </div>
                </div>
            </div>

            {mobileSection === "skills" && (
                <MobileFab onClick={openCreateSkill} label="Add Skill" />
            )}

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
        </>
    );
}

AdminSettingsIndex.layout = (page) => (
    <AdminLayout title="Settings">{page}</AdminLayout>
);
