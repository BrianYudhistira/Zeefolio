import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePlus, HiOutlineTag } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import { mapProjectShowcases } from "@/Utils/projectHelpers";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import ProjectCardItem from "@/Components/Admin/Projects/ProjectCardItem";
import ProjectFormModal from "@/Components/Admin/Projects/ProjectFormModal";
import CustomCategoryModal from "@/Components/Admin/Projects/CustomCategoryModal";

const DEFAULT_PROJECT_CATEGORIES = [
    { id: "default-website", name: "Website", slug: "website", is_global: true },
    { id: "default-mobile", name: "Mobile", slug: "mobile", is_global: true },
    { id: "default-backend", name: "Backend", slug: "backend", is_global: true },
    { id: "default-other", name: "Other", slug: "other", is_global: true },
];

export default function ProjectsIndex({
    projects = [],
    techStacks = [],
    projectCategories = [],
}) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [editingItem, setEditingItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [imagePreview, setImagePreview] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const availableCategories =
        projectCategories.length > 0
            ? projectCategories
            : DEFAULT_PROJECT_CATEGORIES;

    const globalCategories = availableCategories.filter((c) => c.is_global);
    const customCategories = availableCategories.filter((c) => !c.is_global);

    const filterTabs = [
        { value: "all", label: "All Types" },
        ...availableCategories.map((cat) => ({
            value: cat.slug,
            label: cat.name,
            is_global: cat.is_global,
        })),
    ];

    const getCategoryLabel = (slug) => {
        if (!slug) return "";
        const found = availableCategories.find(
            (c) => c.slug?.toLowerCase() === String(slug).toLowerCase()
        );
        return found ? found.name : slug;
    };

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            title: "",
            slug: "",
            type: "personal",
            project_type: availableCategories[0]?.slug || "website",
            custom_project_type: "",
            description: "",
            demo_url: "",
            source_url: "",
            sort_order: 0,
            is_featured: false,
            is_active: true,
            tech_stack_ids: [],
            image: null,
            showcases: [],
        });

    const filteredProjects = projects.filter((p) => {
        if (filterType !== "all" && p.project_type !== filterType) {
            return false;
        }
        const q = search.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    });

    const openCreate = (initialTab = "general") => {
        setEditingItem(null);
        clearErrors();
        setImagePreview(null);
        setActiveTab(initialTab);
        setData({
            title: "",
            slug: "",
            type: "personal",
            project_type: availableCategories[0]?.slug || "website",
            custom_project_type: "",
            description: "",
            demo_url: "",
            source_url: "",
            sort_order: projects.length,
            is_featured: false,
            is_active: true,
            tech_stack_ids: [],
            image: null,
            showcases: [],
        });
        setModalOpen(true);
    };

    const openEdit = (project, initialTab = "general") => {
        setEditingItem(project);
        clearErrors();
        setImagePreview(project.image_url || null);
        setActiveTab(initialTab);
        const currentType =
            project.project_type || availableCategories[0]?.slug || "website";
        const existsInList = availableCategories.some(
            (c) => c.slug?.toLowerCase() === String(currentType).toLowerCase()
        );
        setData({
            title: project.title || "",
            slug: project.slug || "",
            type: project.type || "personal",
            project_type: existsInList ? currentType : "__custom__",
            custom_project_type: existsInList ? "" : currentType,
            description: project.description || "",
            demo_url: project.demo_url || "",
            source_url: project.source_url || "",
            sort_order: project.sort_order ?? 0,
            is_featured: Boolean(project.is_featured),
            is_active: project.is_active !== false,
            tech_stack_ids: (project.tech_stacks || []).map((ts) => ts.id),
            image: null,
            showcases: mapProjectShowcases(project.images || []),
        });
        setModalOpen(true);
    };

    const toggleTechStack = (id) => {
        const exists = data.tech_stack_ids.includes(id);
        setData(
            "tech_stack_ids",
            exists
                ? data.tech_stack_ids.filter((item) => item !== id)
                : [...data.tech_stack_ids, id]
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData("image", file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const projectTitle = data.title.trim() || "Project";
        const isEditing = Boolean(editingItem);
        const targetRoute = isEditing
            ? route("admin.projects.update", editingItem.id)
            : route("admin.projects.store");

        post(targetRoute, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
                notifyAdmin({
                    type: "success",
                    title: isEditing ? "Project Updated" : "Project Created",
                    message: `Project "${projectTitle}" has been ${isEditing ? "updated" : "created"}.`,
                });
            },
        });
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        const title = projectToDelete.title;
        setDeleting(true);

        router.delete(route("admin.projects.destroy", projectToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setProjectToDelete(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: `Project "${title}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AdminLayout
            title="Projects"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCategoryModalOpen(true)}
                        className="admin-btn-ghost inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlineTag className="w-4 h-4" />
                        <span className="sm:hidden">Categories</span>
                        <span className="hidden sm:inline">
                            Custom Categories ({customCategories.length})
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openCreate("general")}
                        className="admin-btn-primary inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span className="sm:hidden">New</span>
                        <span className="hidden sm:inline">New Project</span>
                    </button>
                </div>
            }
        >
            <Head title="Projects - Zeefolio" />

            <div className="space-y-3.5 sm:space-y-4">
                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="admin-pill-track inline-flex items-center gap-1 p-1 rounded-lg border overflow-x-auto max-w-full">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setFilterType(tab.value)}
                                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                    filterType === tab.value
                                        ? "admin-pill-active"
                                        : "admin-pill-inactive"
                                }`}
                            >
                                <span className="sm:hidden">
                                    {tab.value === "all" ? "All" : tab.label}
                                </span>
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search projects..."
                    />
                </div>

                {/* Projects List */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                    {filteredProjects.length === 0 ? (
                        <EmptyState
                            message="No projects matching your criteria."
                            actionLabel="Create Project"
                            onAction={() => openCreate("general")}
                        />
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {filteredProjects.map((project) => (
                                <ProjectCardItem
                                    key={project.id}
                                    project={project}
                                    getCategoryLabel={getCategoryLabel}
                                    onEdit={openEdit}
                                    onDelete={setProjectToDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ProjectFormModal
                open={modalOpen}
                editingItem={editingItem}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                availableCategories={availableCategories}
                globalCategories={globalCategories}
                customCategories={customCategories}
                techStacks={techStacks}
                imagePreview={imagePreview}
                onToggleTechStack={toggleTechStack}
                onImageChange={handleImageChange}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <ConfirmDeleteModal
                open={Boolean(projectToDelete)}
                title="Delete Project"
                description={
                    projectToDelete ? (
                        <>
                            Are you sure you want to delete{" "}
                            <span className="text-zinc-200 font-medium">
                                {projectToDelete.title}
                            </span>{" "}
                            and all of its showcase images?
                        </>
                    ) : null
                }
                confirmLabel="Delete Project"
                processing={deleting}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
            />

            <CustomCategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                globalCategories={globalCategories}
                customCategories={customCategories}
                onCategoryDeleted={(cat) => {
                    if (filterType === cat.slug) {
                        setFilterType("all");
                    }
                }}
            />
        </AdminLayout>
    );
}
