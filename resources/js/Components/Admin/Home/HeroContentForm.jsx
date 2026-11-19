import { HiOutlinePlus, HiXMark } from "react-icons/hi2";

export default function HeroContentForm({
    data,
    setData,
    errors = {},
    passionInput,
    setPassionInput,
    onAddPassion,
    onRemovePassion,
    onPassionKeyDown,
}) {
    const portfolioBaseUrl =
        typeof window !== "undefined" ? `${window.location.origin}/` : "/";
    const passionsError =
        errors?.passions ||
        Object.entries(errors || {}).find(([key]) =>
            key.startsWith("passions.")
        )?.[1];

    return (
        <>
            <div className="order-3 lg:order-none lg:col-start-1 lg:col-span-8 lg:row-start-1 lg:row-span-3 admin-card rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-5">
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
                        <label
                            htmlFor="hero-greeting"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Greeting Text
                        </label>
                        <input
                            id="hero-greeting"
                            type="text"
                            required
                            value={data.greeting}
                            onChange={(e) => setData("greeting", e.target.value)}
                            placeholder="Hello, I am"
                            aria-invalid={Boolean(errors.greeting)}
                            className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors"
                        />
                        {errors.greeting && (
                            <p className="text-xs text-red-400">
                                {errors.greeting}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="hero-display-name"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Display Name
                        </label>
                        <input
                            id="hero-display-name"
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Your Full Name"
                            aria-invalid={Boolean(errors.name)}
                            className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-400">{errors.name}</p>
                        )}
                    </div>
                </div>

                {/* Portfolio URL Slug */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="portfolio-slug"
                        className="block text-xs font-medium text-zinc-300"
                    >
                        Portfolio Link
                    </label>
                    <div className="admin-url-field flex flex-col sm:flex-row sm:items-stretch rounded-lg border overflow-hidden transition-colors">
                        <span
                            title={portfolioBaseUrl}
                            className="admin-url-prefix flex items-center px-3 py-1.5 sm:py-2.5 text-[11px] sm:text-xs font-mono select-none border-b sm:border-b-0 sm:border-r min-w-0 sm:max-w-[55%]"
                        >
                            <span className="truncate">{portfolioBaseUrl}</span>
                        </span>
                        <input
                            id="portfolio-slug"
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
                            placeholder="your-name"
                            aria-invalid={Boolean(errors.slug)}
                            className="flex-1 min-w-0 w-full text-sm font-mono px-3 py-2 sm:py-2.5 border-0 bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:ring-0 outline-none"
                        />
                    </div>
                    {errors.slug && (
                        <p className="text-xs text-red-400">{errors.slug}</p>
                    )}
                </div>

                {/* Interactive Passions / Roles Tags */}
                <div className="space-y-2">
                    <label
                        htmlFor="hero-passion-input"
                        className="block text-xs font-medium text-zinc-300"
                    >
                        <span className="sm:hidden">Roles / Specialties</span>
                        <span className="hidden sm:inline">
                            Roles & Specialties
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="hero-passion-input"
                            type="text"
                            value={passionInput}
                            onChange={(e) => setPassionInput(e.target.value)}
                            onKeyDown={onPassionKeyDown}
                            placeholder="e.g. Fullstack Developer"
                            className="admin-input flex-1 min-w-0 text-sm px-3 py-2 sm:px-3.5 rounded-lg border outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={onAddPassion}
                            title="Add role"
                            aria-label="Add role"
                            className="admin-btn-secondary admin-btn-md admin-btn-mobile-icon inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0"
                        >
                            <HiOutlinePlus className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Add</span>
                        </button>
                    </div>

                    {data.passions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                            {data.passions.map((passion) => (
                                <span
                                    key={passion}
                                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                                >
                                    <span className="truncate max-w-[180px] sm:max-w-none">
                                        {passion}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemovePassion(passion)}
                                        aria-label={`Remove ${passion}`}
                                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700/60 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                                    >
                                        <HiXMark className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {passionsError && (
                        <p className="text-xs text-red-400">{passionsError}</p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <label
                            htmlFor="hero-description"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            About / Bio Description
                        </label>
                        <span
                            className={`text-[11px] font-mono tabular-nums ${
                                (data.description?.trim().length || 0) >= 50
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                            }`}
                        >
                            {data.description?.trim().length || 0} / 50 min chars
                        </span>
                    </div>
                    <textarea
                        id="hero-description"
                        rows={4}
                        required
                        minLength={50}
                        maxLength={2000}
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Write a concise summary about your background (min. 50 characters for SEO indexing)..."
                        aria-invalid={Boolean(errors.description)}
                        className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors resize-y"
                    />
                    <p className="text-[11px] text-zinc-500">
                        Minimum 50 characters required so search engines index your portfolio instead of treating it as thin content.
                    </p>
                    {errors.description && (
                        <p className="text-xs text-red-400">
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Social Media Links */}
            <div className="order-5 lg:order-none lg:col-start-1 lg:col-span-8 lg:row-start-4 lg:row-span-2 admin-card rounded-xl border p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Social Media Links
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Links displayed on your hero and contact sections.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {["github", "linkedin", "instagram", "website"].map(
                        (platform) => {
                            const fieldError =
                                errors?.[`social_media_links.${platform}`];
                            const inputId = `social-${platform}`;
                            return (
                                <div key={platform} className="space-y-1">
                                    <label
                                        htmlFor={inputId}
                                        className="block text-xs font-medium text-zinc-300 capitalize"
                                    >
                                        {platform}
                                    </label>
                                    <input
                                        id={inputId}
                                        type="url"
                                        value={
                                            data.social_media_links[platform] ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setData("social_media_links", {
                                                ...data.social_media_links,
                                                [platform]: e.target.value,
                                            })
                                        }
                                        placeholder={
                                            platform === "website"
                                                ? "https://yourdomain.com"
                                                : `https://${platform}.com/...`
                                        }
                                        aria-invalid={Boolean(fieldError)}
                                        className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 rounded-lg border outline-none transition-colors"
                                    />
                                    {fieldError && (
                                        <p className="text-xs text-red-400">
                                            {fieldError}
                                        </p>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        </>
    );
}
