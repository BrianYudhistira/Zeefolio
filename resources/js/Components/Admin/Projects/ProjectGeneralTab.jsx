import { Link } from "@inertiajs/react";
import { HiOutlinePhoto, HiOutlinePlus } from "react-icons/hi2";

export default function ProjectGeneralTab({
    data,
    setData,
    errors = {},
    availableCategories = [],
    globalCategories = [],
    customCategories = [],
    techStacks = [],
    imagePreview,
    onToggleTechStack,
    onImageChange,
}) {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Project Title
                    </label>
                    <input
                        type="text"
                        required
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        placeholder="e.g. Halmall Seller"
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                    {errors.title && (
                        <p className="text-xs text-red-400">{errors.title}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Custom Link (Optional)
                    </label>
                    <input
                        type="text"
                        value={data.slug}
                        onChange={(e) => setData("slug", e.target.value)}
                        placeholder="auto-generated-from-title"
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                    {errors.slug && (
                        <p className="text-xs text-red-400">{errors.slug}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-medium text-zinc-300">
                            Category Type
                        </label>
                        <button
                            type="button"
                            onClick={() =>
                                setData(
                                    "project_type",
                                    data.project_type === "__custom__"
                                        ? availableCategories[0]?.slug ||
                                              "website"
                                        : "__custom__"
                                )
                            }
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                            {data.project_type === "__custom__"
                                ? "Select existing"
                                : "+ Custom"}
                        </button>
                    </div>
                    <select
                        value={data.project_type}
                        onChange={(e) =>
                            setData("project_type", e.target.value)
                        }
                        className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    >
                        {globalCategories.length > 0 && (
                            <optgroup label="Default Categories">
                                {globalCategories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {customCategories.length > 0 && (
                            <optgroup label="My Custom Categories">
                                {customCategories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name} (Custom)
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        <option value="__custom__">
                            + Create New Custom Category...
                        </option>
                    </select>
                    {data.project_type === "__custom__" && (
                        <input
                            type="text"
                            required
                            value={data.custom_project_type}
                            onChange={(e) =>
                                setData("custom_project_type", e.target.value)
                            }
                            placeholder="Enter custom category (e.g. AI / ML, Desktop App)"
                            className="w-full text-xs px-3 py-2 mt-1.5 rounded-lg bg-zinc-950 border border-emerald-500/40 focus:border-emerald-400 text-zinc-100 placeholder-zinc-500 outline-none"
                        />
                    )}
                    {(errors.project_type || errors.custom_project_type) && (
                        <p className="text-xs text-red-400">
                            {errors.project_type || errors.custom_project_type}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Ownership Type
                    </label>
                    <input
                        type="text"
                        value={data.type}
                        onChange={(e) => setData("type", e.target.value)}
                        placeholder="personal / client"
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Sort Order
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={data.sort_order}
                        onChange={(e) =>
                            setData("sort_order", Number(e.target.value))
                        }
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Live Demo URL
                    </label>
                    <input
                        type="url"
                        value={data.demo_url}
                        onChange={(e) => setData("demo_url", e.target.value)}
                        placeholder="https://example.com"
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                    {errors.demo_url && (
                        <p className="text-xs text-red-400">
                            {errors.demo_url}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Source Code URL
                    </label>
                    <input
                        type="url"
                        value={data.source_url}
                        onChange={(e) => setData("source_url", e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                    />
                    {errors.source_url && (
                        <p className="text-xs text-red-400">
                            {errors.source_url}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                    Description
                </label>
                <textarea
                    rows={4}
                    required
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Describe the project architecture, features, and outcomes..."
                    className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                />
                {errors.description && (
                    <p className="text-xs text-red-400">{errors.description}</p>
                )}
            </div>

            {/* Interactive Skills & Technologies Multi-Select */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-medium text-zinc-300">
                        Skills Used ({data.tech_stack_ids.length} selected)
                    </label>
                    <Link
                        href={route("admin.skills.index")}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <HiOutlinePlus className="w-3 h-3" />
                        <span>Add Skill</span>
                    </Link>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    {techStacks.map((ts) => {
                        const selected = data.tech_stack_ids.includes(ts.id);
                        return (
                            <button
                                key={ts.id}
                                type="button"
                                onClick={() => onToggleTechStack(ts.id)}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                    selected
                                        ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                                        : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                                }`}
                            >
                                {ts.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cover Image & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <HiOutlinePhoto className="w-5 h-5 text-zinc-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Hero Cover Image
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={onImageChange}
                            className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-700 file:text-xs file:bg-zinc-800 file:text-zinc-200"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5 sm:justify-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) =>
                                setData("is_featured", e.target.checked)
                            }
                            className="rounded bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-0"
                        />
                        <span className="text-xs text-zinc-300">
                            Featured Project
                        </span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData("is_active", e.target.checked)
                            }
                            className="rounded bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-0"
                        />
                        <span className="text-xs text-zinc-300">Active</span>
                    </label>
                </div>
            </div>
        </>
    );
}
