import {
    HiOutlinePhoto,
    HiOutlineDocumentArrowUp,
} from "react-icons/hi2";

export default function QuickBioSidebar({
    data,
    setData,
    errors = {},
    processing,
    imagePreview,
    cvUrl,
    onImageChange,
}) {
    return (
        <>
            {/* Status Toggle */}
            <div className="order-1 lg:order-none lg:col-start-9 lg:col-span-4 lg:row-start-1 admin-card rounded-xl border p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p
                        id="portfolio-visibility-label"
                        className="text-sm font-medium text-zinc-100"
                    >
                        Portfolio Visibility
                    </p>
                    <p className="text-xs text-zinc-400">
                        {data.is_active
                            ? "Publicly active"
                            : "Hidden / Draft mode"}
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(data.is_active)}
                    aria-labelledby="portfolio-visibility-label"
                    onClick={() => setData("is_active", !data.is_active)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${
                        data.is_active ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            data.is_active ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                </button>
            </div>

            {/* Profile Photo */}
            <div className="order-2 lg:order-none lg:col-start-9 lg:col-span-4 lg:row-start-2 admin-card rounded-xl border p-4 sm:p-5 space-y-3 sm:space-y-4">
                <h3 className="text-sm font-semibold text-zinc-100">
                    Profile Image
                </h3>
                <div className="flex items-center gap-3.5 sm:block sm:space-y-4">
                    <div
                        className={`shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center sm:w-full sm:max-w-[220px] sm:mx-auto ${
                            imagePreview
                                ? "w-20 max-h-28 sm:max-h-64"
                                : "w-16 h-16 sm:h-44"
                        }`}
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                className="w-full h-auto max-h-28 sm:max-h-64 object-contain"
                            />
                        ) : (
                            <HiOutlinePhoto className="w-7 h-7 sm:w-10 sm:h-10 text-zinc-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <label
                            htmlFor="home-profile-image"
                            className="admin-btn-secondary admin-btn-md flex items-center justify-center w-full font-medium cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[var(--orange)]"
                        >
                            <HiOutlinePhoto className="w-4 h-4 text-[var(--indigo)] shrink-0" />
                            <span className="truncate">
                                {data.image ? data.image.name : "Choose Image"}
                            </span>
                            <input
                                id="home-profile-image"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={onImageChange}
                                className="sr-only"
                            />
                        </label>
                        <p className="text-[11px] text-zinc-500 sm:text-center">
                            JPG, PNG, WEBP (Square recommended)
                        </p>
                    </div>
                </div>
                {errors.image && (
                    <p className="text-xs text-red-400">{errors.image}</p>
                )}
            </div>

            {/* CV / Resume Document */}
            <div className="order-4 lg:order-none lg:col-start-9 lg:col-span-4 lg:row-start-3 admin-card rounded-xl border p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        Resume / CV
                    </h3>
                    {cvUrl && (
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 text-xs text-emerald-400 hover:text-emerald-300 underline"
                        >
                            View CV
                        </a>
                    )}
                </div>
                <label
                    htmlFor="home-cv-file"
                    className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[var(--orange)]"
                >
                    <HiOutlineDocumentArrowUp className="w-5 h-5 text-[var(--emerald)] shrink-0" />
                    <span className="text-xs text-zinc-300 truncate">
                        {data.cv
                            ? data.cv.name
                            : "Upload PDF / DOCX (Max 5MB)"}
                    </span>
                    <input
                        id="home-cv-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                            setData("cv", e.target.files?.[0] || null)
                        }
                        className="sr-only"
                    />
                </label>
                {errors.cv && (
                    <p className="text-xs text-red-400">{errors.cv}</p>
                )}
            </div>

            {/* Save Button */}
            <button
                type="submit"
                disabled={processing}
                className="order-6 lg:order-none lg:col-start-9 lg:col-span-4 lg:row-start-4 lg:self-start admin-btn-primary admin-btn-lg inline-flex items-center justify-center w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
                {processing ? "Saving..." : "Save Changes"}
            </button>
        </>
    );
}
