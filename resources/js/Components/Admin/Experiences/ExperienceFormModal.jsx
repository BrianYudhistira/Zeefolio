import { HiXMark } from "react-icons/hi2";

export default function ExperienceFormModal({
    open,
    editingItem,
    data,
    setData,
    errors,
    processing,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        {editingItem ? "Edit Experience" : "Add Experience"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Company Name
                            </label>
                            <input
                                type="text"
                                required
                                value={data.company}
                                onChange={(e) =>
                                    setData("company", e.target.value)
                                }
                                placeholder="e.g. Acme Corp"
                                className="w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.company && (
                                <p className="text-xs text-red-400">
                                    {errors.company}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Role / Position
                            </label>
                            <input
                                type="text"
                                required
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                                placeholder="e.g. Backend Engineer"
                                className="w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.position && (
                                <p className="text-xs text-red-400">
                                    {errors.position}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Start Date
                            </label>
                            <input
                                type="date"
                                required
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.start_date && (
                                <p className="text-xs text-red-400">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.end_date && (
                                <p className="text-xs text-red-400">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData(
                                        "sort_order",
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {errors.sort_order && (
                                <p className="text-xs text-red-400">
                                    {errors.sort_order}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Tech Stack (Comma separated)
                        </label>
                        <input
                            type="text"
                            value={data.tech_stack}
                            onChange={(e) =>
                                setData("tech_stack", e.target.value)
                            }
                            placeholder="e.g. Laravel, React, PostgreSQL, Docker"
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {errors.tech_stack && (
                            <p className="text-xs text-red-400">
                                {errors.tech_stack}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Description / Key Achievements
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Describe your responsibilities and impact..."
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-400">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
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
                                  : "Create Experience"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
