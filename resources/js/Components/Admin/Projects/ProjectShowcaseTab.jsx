import { useEffect, useRef } from "react";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineRectangleGroup,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiXMark,
} from "react-icons/hi2";

export default function ProjectShowcaseTab({
    showcases = [],
    errors = {},
    onChangeShowcases,
}) {
    const createdBlobUrlsRef = useRef(new Set());

    useEffect(() => {
        const created = createdBlobUrlsRef.current;
        return () => {
            created.forEach((url) => URL.revokeObjectURL(url));
            created.clear();
        };
    }, []);

    const revokeUrlIfOwned = (url) => {
        if (url && createdBlobUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            createdBlobUrlsRef.current.delete(url);
        }
    };

    const addShowcaseItem = () => {
        onChangeShowcases([
            ...showcases,
            {
                id: null,
                title: "",
                description: "",
                existing_images: [],
                existing_previews: [],
                new_images: [],
                new_previews: [],
            },
        ]);
    };

    const updateShowcaseField = (index, field, value) => {
        const next = [...showcases];
        next[index] = {
            ...next[index],
            [field]: value,
        };
        onChangeShowcases(next);
    };

    const removeShowcaseItem = (index) => {
        const target = showcases[index];
        target?.new_previews?.forEach(revokeUrlIfOwned);
        const next = showcases.filter((_, idx) => idx !== index);
        onChangeShowcases(next);
    };

    const moveShowcaseItem = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= showcases.length) return;
        const next = [...showcases];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        onChangeShowcases(next);
    };

    const handleAddShowcaseFiles = (index, fileList) => {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        const next = [...showcases];
        const current = next[index];
        const previews = files.map((file) => {
            const url = URL.createObjectURL(file);
            createdBlobUrlsRef.current.add(url);
            return url;
        });

        next[index] = {
            ...current,
            new_images: [...(current.new_images || []), ...files],
            new_previews: [...(current.new_previews || []), ...previews],
        };
        onChangeShowcases(next);
    };

    const removeExistingShowcaseImage = (showcaseIndex, imgIndex) => {
        const next = [...showcases];
        const current = next[showcaseIndex];
        next[showcaseIndex] = {
            ...current,
            existing_images: current.existing_images.filter(
                (_, i) => i !== imgIndex
            ),
            existing_previews: current.existing_previews.filter(
                (_, i) => i !== imgIndex
            ),
        };
        onChangeShowcases(next);
    };

    const removeNewShowcaseImage = (showcaseIndex, imgIndex) => {
        const next = [...showcases];
        const current = next[showcaseIndex];
        const removedUrl = current.new_previews?.[imgIndex];
        revokeUrlIfOwned(removedUrl);
        next[showcaseIndex] = {
            ...current,
            new_images: current.new_images.filter((_, i) => i !== imgIndex),
            new_previews: current.new_previews.filter((_, i) => i !== imgIndex),
        };
        onChangeShowcases(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                    <h4 className="text-sm font-semibold text-zinc-100">
                        Visual Walkthrough & Screenshots
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Add interactive screen previews with titles, descriptions, and single or multiple slide images.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addShowcaseItem}
                    className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer shrink-0"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Add Showcase</span>
                </button>
            </div>

            {showcases.length === 0 ? (
                <div className="py-12 px-4 rounded-xl border border-dashed border-zinc-800 text-center space-y-3">
                    <HiOutlineRectangleGroup className="w-8 h-8 text-zinc-600 mx-auto" />
                    <div>
                        <p className="text-xs font-medium text-zinc-300">
                            No showcase items added yet
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Add walkthrough sections to display screenshots and feature explanations on the project detail page.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addShowcaseItem}
                        className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Add Showcase</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {showcases.map((showcase, idx) => {
                        const totalSlides =
                            (showcase.existing_previews?.length || 0) +
                            (showcase.new_previews?.length || 0);
                        const titleError = errors?.[`showcases.${idx}.title`];
                        const descError =
                            errors?.[`showcases.${idx}.description`];
                        const imageError = Object.entries(errors || {}).find(
                            ([key]) =>
                                key === `showcases.${idx}.new_images` ||
                                key.startsWith(`showcases.${idx}.new_images.`)
                        )?.[1];
                        const titleId = `showcase-title-${idx}`;
                        const descId = `showcase-desc-${idx}`;
                        const uploadId = `showcase-upload-${idx}`;

                        return (
                            <div
                                key={showcase.id ?? `new-${idx}`}
                                className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-4"
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 shrink-0 tabular-nums">
                                            {String(idx + 1).padStart(2, "0")} /{" "}
                                            {String(showcases.length).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>
                                        <span className="text-xs font-medium text-zinc-200 truncate">
                                            {showcase.title ||
                                                `Showcase Item #${idx + 1}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() =>
                                                moveShowcaseItem(idx, -1)
                                            }
                                            className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                                            aria-label="Move showcase up"
                                            title="Move up"
                                        >
                                            <HiOutlineArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                idx === showcases.length - 1
                                            }
                                            onClick={() =>
                                                moveShowcaseItem(idx, 1)
                                            }
                                            className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
                                            aria-label="Move showcase down"
                                            title="Move down"
                                        >
                                            <HiOutlineArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeShowcaseItem(idx)
                                            }
                                            className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            aria-label="Remove showcase item"
                                            title="Remove showcase item"
                                        >
                                            <HiOutlineTrash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1">
                                        <label
                                            htmlFor={titleId}
                                            className="block text-xs font-medium text-zinc-300"
                                        >
                                            Showcase Title
                                        </label>
                                        <input
                                            id={titleId}
                                            type="text"
                                            value={showcase.title}
                                            onChange={(e) =>
                                                updateShowcaseField(
                                                    idx,
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Seller Login Portal"
                                            aria-invalid={Boolean(titleError)}
                                            className="admin-input w-full text-xs px-3 py-2 rounded-lg border outline-none transition-colors"
                                        />
                                        {titleError && (
                                            <p className="text-xs text-red-400">
                                                {titleError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label
                                            htmlFor={descId}
                                            className="block text-xs font-medium text-zinc-300"
                                        >
                                            Walkthrough Description
                                        </label>
                                        <textarea
                                            id={descId}
                                            rows={2}
                                            value={showcase.description}
                                            onChange={(e) =>
                                                updateShowcaseField(
                                                    idx,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Explain what this screen does and its key features..."
                                            aria-invalid={Boolean(descError)}
                                            className="admin-input w-full text-xs px-3 py-2 rounded-lg border outline-none transition-colors"
                                        />
                                        {descError && (
                                            <p className="text-xs text-red-400">
                                                {descError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Screenshots / Slides Manager */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="block text-xs font-medium text-zinc-300">
                                            Screenshots / Slides ({totalSlides})
                                        </span>
                                        <label
                                            htmlFor={uploadId}
                                            className="admin-btn-secondary admin-btn-xs inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-[var(--orange)]"
                                        >
                                            <HiOutlinePlus className="w-3.5 h-3.5" />
                                            <span>Upload Images</span>
                                            <input
                                                id={uploadId}
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={(e) => {
                                                    handleAddShowcaseFiles(
                                                        idx,
                                                        e.target.files
                                                    );
                                                    e.target.value = "";
                                                }}
                                                className="sr-only"
                                            />
                                        </label>
                                    </div>
                                    {imageError && (
                                        <p className="text-xs text-red-400">
                                            {imageError}
                                        </p>
                                    )}

                                    {totalSlides === 0 ? (
                                        <div className="py-4 px-3 rounded-lg bg-zinc-900/60 border border-dashed border-zinc-800 text-center">
                                            <p className="text-[11px] text-zinc-500">
                                                No screenshots uploaded for this showcase item yet. You can upload one or multiple images (slider).
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2.5 pt-1">
                                            {/* Existing Saved Images */}
                                            {showcase.existing_previews?.map(
                                                (src, imgIdx) => (
                                                    <div
                                                        key={`existing-${imgIdx}`}
                                                        className="relative w-28 h-20 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden group"
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`Slide ${imgIdx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="admin-media-overlay-badge absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                                            #{imgIdx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeExistingShowcaseImage(
                                                                    idx,
                                                                    imgIdx
                                                                )
                                                            }
                                                            className="admin-media-overlay-btn absolute top-1 right-1 w-7 h-7 rounded-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity cursor-pointer"
                                                            aria-label="Remove screenshot"
                                                            title="Remove image"
                                                        >
                                                            <HiXMark className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}

                                            {/* Newly Selected Images */}
                                            {showcase.new_previews?.map(
                                                (src, imgIdx) => (
                                                    <div
                                                        key={`new-${imgIdx}`}
                                                        className="relative w-28 h-20 rounded-lg bg-zinc-900 border border-emerald-500/40 overflow-hidden group"
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`New slide ${imgIdx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                                                            New
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeNewShowcaseImage(
                                                                    idx,
                                                                    imgIdx
                                                                )
                                                            }
                                                            className="admin-media-overlay-btn absolute top-1 right-1 w-7 h-7 rounded-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity cursor-pointer"
                                                            aria-label="Remove screenshot"
                                                            title="Remove image"
                                                        >
                                                            <HiXMark className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
