import {
    HiOutlinePhoto,
    HiOutlineDocumentArrowUp,
} from "react-icons/hi2";

export default function QuickBioSidebar({
    data,
    setData,
    errors,
    processing,
    imagePreview,
    cvUrl,
    onImageChange,
}) {
    return (
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Status Toggle */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-100">
                        Portfolio Visibility
                    </p>
                    <p className="text-xs text-zinc-400">
                        {data.is_active ? "Publicly active" : "Hidden / Draft mode"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setData("is_active", !data.is_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${data.is_active ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_active ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            {/* Profile Photo (Compact Horizontal on Mobile, Card on Desktop) */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-3 sm:space-y-4">
                <h3 className="text-sm font-semibold text-zinc-100">
                    Profile Image
                </h3>
                <div className="flex items-center gap-3.5 sm:block sm:space-y-4">
                    <div
                        className={`shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center sm:w-full sm:max-w-[220px] sm:mx-auto ${imagePreview
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
                        <label className="inline-flex sm:flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer transition-colors w-full">
                            <HiOutlinePhoto className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="truncate">
                                {data.image ? data.image.name : "Choose Image"}
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={onImageChange}
                                className="hidden"
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
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        Resume / CV
                    </h3>
                    {cvUrl && (
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                        >
                            View CV
                        </a>
                    )}
                </div>
                <label className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                    <HiOutlineDocumentArrowUp className="w-5 h-5 text-zinc-400 shrink-0" />
                    <span className="text-xs text-zinc-300 truncate">
                        {data.cv ? data.cv.name : "Upload PDF / DOCX (Max 5MB)"}
                    </span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                            setData("cv", e.target.files?.[0] || null)
                        }
                        className="hidden"
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
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
                {processing ? "Saving Changes..." : "Save Changes"}
            </button>
        </div>
    );
}
