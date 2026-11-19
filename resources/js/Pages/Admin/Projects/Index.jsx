import { useEffect, useRef, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import MobileFab from "@/Components/Admin/MobileFab";
import { HiOutlinePlus, HiOutlineTag } from "react-icons/hi2";
import { mapProjectShowcases } from "@/Utils/projectHelpers";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import ProjectCardItem from "@/Components/Admin/Projects/ProjectCardItem";
import ProjectFormModal from "@/Components/Admin/Projects/ProjectFormModal";
import CustomCategoryModal from "@/Components/Admin/Shared/CustomCategoryModal";

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
    const coverBlobRef = useRef(null);

    const revokeCoverBlob = () => {
        if (coverBlobRef.current) {
            URL.revokeObjectURL(coverBlobRef.current);
            coverBlobRef.current = null;
        }
    };

    useEffect(() => revokeCoverBlob, []);

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
        if (
            filterType !== "all" &&
            p.project_type?.toLowerCase() !== filterType.toLowerCase()
        ) {
            return false;
        }
        const q = search.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    });

    const openCreate = (initialTab = "general") => {
        revokeCoverBlob();
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
        revokeCoverBlob();
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
        revokeCoverBlob();
        if (file) {
            const url = URL.createObjectURL(file);
            coverBlobRef.current = url;
            setImagePreview(url);
        } else {
            setImagePreview(editingItem?.image_url || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isEditing = Boolean(editingItem);
        const targetRoute = isEditing
            ? route("admin.projects.update", editingItem.id)
            : route("admin.projects.store");

        post(targetRoute, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                revokeCoverBlob();
                setModalOpen(false);
                reset();
            },
            onError: (errs) => {
                const keys = Object.keys(errs || {});
                const hasGeneralError = keys.some(
                    (k) => !k.startsWith("showcases")
                );
                const hasShowcaseError = keys.some((k) =>
                    k.startsWith("showcases")
                );
                if (activeTab === "showcase" && hasGeneralError) {
                    setActiveTab("general");
                } else if (
                    activeTab === "general" &&
                    hasShowcaseError &&
                    !hasGeneralError
                ) {
                    setActiveTab("showcase");
                }
            },
        });
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        setDeleting(true);

        router.delete(route("admin.projects.destroy", projectToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setProjectToDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasActiveFilter = filterType !== "all" || search.trim() !== "";

    return (
        <>
            <Head title="Projects" />

            <div className="space-y-3.5 sm:space-y-4 pb-20 sm:pb-0">
                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                        <div className="admin-scroll-strip overflow-x-auto max-w-full min-w-0 pb-2 sm:-mb-2">
                            <div className="admin-pill-track inline-flex items-center gap-1 p-1 rounded-lg border">
                                {filterTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        aria-pressed={filterType === tab.value}
                                        onClick={() => setFilterType(tab.value)}
                                        className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                            filterType === tab.value
                                                ? "admin-pill-active"
                                                : "admin-pill-inactive"
                                        }`}
                                    >
                                        <span className="sm:hidden">
                                            {tab.value === "all"
                                                ? "All"
                                                : tab.label}
                                        </span>
                                        <span className="hidden sm:inline">
                                            {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCategoryModalOpen(true)}
                            title="Manage Categories"
                            aria-label="Manage Categories"
                            className="admin-btn-ghost admin-btn-sm admin-btn-mobile-icon mt-0.5 sm:mt-0 inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0"
                        >
                            <HiOutlineTag className="w-4 h-4 text-[var(--indigo)] shrink-0" />
                            <span className="hidden sm:inline">
                                Categories ({customCategories.length})
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search projects..."
                            className="w-full sm:w-56 md:w-64"
                        />

                        <button
                            type="button"
                            onClick={() => openCreate("general")}
                            className="admin-btn-primary admin-btn-sm hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                            <HiOutlinePlus className="w-4 h-4 shrink-0" />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>

                {/* Projects List */}
                {filteredProjects.length === 0 ? (
                    <div className="admin-card rounded-xl border overflow-hidden">
                        <EmptyState
                            message={
                                hasActiveFilter
                                    ? "No projects match your current filters."
                                    : "No projects added yet."
                            }
                            actionLabel={
                                hasActiveFilter
                                    ? "Clear Filters"
                                    : "Create Project"
                            }
                            onAction={() => {
                                if (hasActiveFilter) {
                                    setFilterType("all");
                                    setSearch("");
                                } else {
                                    openCreate("general");
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
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

            <MobileFab
                onClick={() => openCreate("general")}
                label="New Project"
            />

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
                onClose={() => {
                    if (processing) return;
                    revokeCoverBlob();
                    setModalOpen(false);
                }}
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
                onCategoryDeleted={(deletedCat) => {
                    if (filterType === deletedCat.slug) {
                        setFilterType("all");
                    }
                }}
            />
        </>
    );
}

ProjectsIndex.layout = (page) => (
    <AdminLayout title="Projects">{page}</AdminLayout>
);
