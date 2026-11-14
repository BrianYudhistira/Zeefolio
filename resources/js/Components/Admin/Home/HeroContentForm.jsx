import { HiOutlinePlus, HiXMark } from "react-icons/hi2";

export default function HeroContentForm({
    data,
    setData,
    errors,
    passionInput,
    setPassionInput,
    onAddPassion,
    onRemovePassion,
    onPassionKeyDown,
}) {
    return (
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Hero Introduction
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Configure the primary headline, dynamic roles, and bio shown on your portfolio landing section.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Greeting Text
                        </label>
                        <input
                            type="text"
                            required
                            value={data.greeting}
                            onChange={(e) => setData("greeting", e.target.value)}
                            placeholder="Hello, I am"
                            className="w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                        />
                        {errors.greeting && (
                            <p className="text-xs text-red-400">{errors.greeting}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Display Name
                        </label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Your Full Name"
                            className="w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-400">{errors.name}</p>
                        )}
                    </div>
                </div>

                {/* Portfolio URL Slug */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Portfolio URL Slug
                    </label>
                    <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 focus-within:border-zinc-600 overflow-hidden transition-colors">
                        <span className="px-3 py-2 sm:py-2.5 text-xs font-mono text-zinc-500 bg-zinc-900/70 border-r border-zinc-800 select-none shrink-0">
                            {typeof window !== "undefined"
                                ? `${window.location.origin}/`
                                : "/"}
                        </span>
                        <input
                            type="text"
                            required
                            value={data.slug || ""}
                            onChange={(e) =>
                                setData(
                                    "slug",
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-_]/g, "-")
                                )
                            }
                            placeholder="your-portfolio-slug"
                            className="w-full text-sm font-mono px-3 py-2 sm:py-2.5 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none"
                        />
                    </div>
                    {errors.slug && (
                        <p className="text-xs text-red-400">{errors.slug}</p>
                    )}
                </div>

                {/* Interactive Passions / Roles Tags */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-300">
                        <span className="sm:hidden">Roles / Passions</span>
                        <span className="hidden sm:inline">Roles / Passions (Typewriter Text)</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={passionInput}
                            onChange={(e) => setPassionInput(e.target.value)}
                            onKeyDown={onPassionKeyDown}
                            placeholder="e.g. Fullstack Developer"
                            className="flex-1 min-w-0 text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={onAddPassion}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer shrink-0"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                            <span>Add</span>
                        </button>
                    </div>

                    {data.passions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                            {data.passions.map((passion) => (
                                <span
                                    key={passion}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                                >
                                    <span className="truncate max-w-[180px] sm:max-w-none">{passion}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemovePassion(passion)}
                                        className="text-zinc-400 hover:text-white shrink-0"
                                    >
                                        <HiXMark className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        About / Bio Description
                    </label>
                    <textarea
                        rows={4}
                        required
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Write a concise summary about your background..."
                        className="w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors resize-y"
                    />
                    {errors.description && (
                        <p className="text-xs text-red-400">{errors.description}</p>
                    )}
                </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Social Media Links
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Links displayed on your hero and contact sections.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {["github", "linkedin", "instagram", "website"].map((platform) => (
                        <div key={platform} className="space-y-1">
                            <label className="block text-xs font-medium text-zinc-300 capitalize">
                                {platform}
                            </label>
                            <input
                                type="text"
                                value={data.social_media_links[platform] || ""}
                                onChange={(e) =>
                                    setData("social_media_links", {
                                        ...data.social_media_links,
                                        [platform]: e.target.value,
                                    })
                                }
                                placeholder={`https://${platform}.com/...`}
                                className="w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
