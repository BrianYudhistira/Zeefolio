import { HiOutlineRectangleGroup, HiXMark } from "react-icons/hi2";
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
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-3xl my-4 sm:my-8 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-100 truncate">
                            {editingItem
                                ? `Edit Project — ${editingItem.title}`
                                : "New Project"}
                        </h3>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                            Configure project details, tech stacks, and interface showcase screenshots.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Tabs */}
                <div className="px-5 pt-3 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab("general")}
                        className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                            activeTab === "general"
                                ? "border-zinc-200 text-zinc-100"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        1. General & Tech Stack
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("showcase")}
                        className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "showcase"
                                ? "border-zinc-200 text-zinc-100"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <HiOutlineRectangleGroup className="w-4 h-4" />
                        <span>
                            2. Interface Showcase ({data.showcases.length})
                        </span>
                    </button>
                </div>

                {/* Modal Form Body */}
                <form
                    onSubmit={onSubmit}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="p-5 overflow-y-auto space-y-5 flex-1">
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
                                onChangeShowcases={(next) =>
                                    setData("showcases", next)
                                }
                            />
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2 shrink-0">
                        <div className="text-xs text-zinc-500">
                            {activeTab === "general" ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("showcase")}
                                    className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                                >
                                    Next: Configure Interface Showcase (
                                    {data.showcases.length}) →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("general")}
                                    className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                                >
                                    ← Back to General Info
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-medium text-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
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
            </div>
        </div>
    );
}
