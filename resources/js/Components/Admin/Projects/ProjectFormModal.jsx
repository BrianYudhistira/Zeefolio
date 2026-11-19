import { HiOutlineRectangleGroup } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";
import ProjectGeneralTab from "./ProjectGeneralTab";
import ProjectShowcaseTab from "./ProjectShowcaseTab";

export default function ProjectFormModal({
    open,
    editingItem,
    activeTab,
    setActiveTab,
    data,
    setData,
    errors,
    processing,
    availableCategories,
    globalCategories,
    customCategories,
    techStacks,
    imagePreview,
    onToggleTechStack,
    onImageChange,
    onClose,
    onSubmit,
}) {
    const errorKeys = Object.keys(errors || {});
    const hasGeneralErrors = errorKeys.some(
        (key) => !key.startsWith("showcases")
    );
    const hasShowcaseErrors = errorKeys.some((key) =>
        key.startsWith("showcases")
    );

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={
                editingItem
                    ? `Edit Project — ${editingItem.title}`
                    : "New Project"
            }
            subtitle="Configure project details, tech stacks, and interface showcase screenshots."
            maxWidthClass="max-w-3xl"
            preventClose={processing}
            panelClassName="max-h-[92vh]"
        >
            {/* Modal Tabs */}
            <div
                role="tablist"
                aria-label="Project sections"
                className="px-4 sm:px-5 pt-2.5 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2 shrink-0 overflow-x-auto admin-scroll-strip"
            >
                <button
                    type="button"
                    role="tab"
                    id="project-tab-general"
                    aria-selected={activeTab === "general"}
                    aria-controls="project-panel-general"
                    onClick={() => setActiveTab("general")}
                    className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        activeTab === "general"
                            ? "border-zinc-200 text-zinc-100"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <span>1. General & Tech Stack</span>
                    {hasGeneralErrors && (
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"
                            aria-label="Has validation errors"
                        />
                    )}
                </button>
                <button
                    type="button"
                    role="tab"
                    id="project-tab-showcase"
                    aria-selected={activeTab === "showcase"}
                    aria-controls="project-panel-showcase"
                    onClick={() => setActiveTab("showcase")}
                    className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        activeTab === "showcase"
                            ? "border-zinc-200 text-zinc-100"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    <HiOutlineRectangleGroup className="w-4 h-4 shrink-0" />
                    <span>
                        2. Interface Showcase ({data.showcases.length})
                    </span>
                    {hasShowcaseErrors && (
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"
                            aria-label="Has validation errors"
                        />
                    )}
                </button>
            </div>

            {/* Modal Form Body */}
            <form
                onSubmit={onSubmit}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
                <div
                    role="tabpanel"
                    id={
                        activeTab === "general"
                            ? "project-panel-general"
                            : "project-panel-showcase"
                    }
                    aria-labelledby={
                        activeTab === "general"
                            ? "project-tab-general"
                            : "project-tab-showcase"
                    }
                    className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1"
                >
                    {activeTab === "general" ? (
                        <ProjectGeneralTab
                            data={data}
                            setData={setData}
                            errors={errors}
                            availableCategories={availableCategories}
                            globalCategories={globalCategories}
                            customCategories={customCategories}
                            techStacks={techStacks}
                            imagePreview={imagePreview}
                            onToggleTechStack={onToggleTechStack}
                            onImageChange={onImageChange}
                        />
                    ) : (
                        <ProjectShowcaseTab
                            showcases={data.showcases}
                            errors={errors}
                            onChangeShowcases={(next) =>
                                setData("showcases", next)
                            }
                        />
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 sm:px-5 py-3 border-t border-zinc-800 bg-zinc-950/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="text-xs text-zinc-500">
                        {activeTab === "general" ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab("showcase")}
                                className="py-1.5 px-1 text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                            >
                                Showcase ({data.showcases.length}) →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setActiveTab("general")}
                                className="py-1.5 px-1 text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                            >
                                ← General Info
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={onClose}
                            className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="admin-btn-primary admin-btn-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing
                                ? "Saving..."
                                : editingItem
                                  ? "Save Changes"
                                  : "Create Project"}
                        </button>
                    </div>
                </div>
            </form>
        </AdminModal>
    );
}
