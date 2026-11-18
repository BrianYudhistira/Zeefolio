import { Link } from "@inertiajs/react";

export default function PaginationBar({ links = [] }) {
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <div className="px-4 py-3 border-t border-[var(--border)] flex flex-wrap items-center justify-center sm:justify-end gap-1.5 bg-[color-mix(in_srgb,var(--surface-elevated)_35%,var(--surface))]">
            {links.map((link, idx) => {
                const label = link.label
                    .replace("&laquo; Previous", "Prev")
                    .replace("Next &raquo;", "Next");

                if (!link.url) {
                    return (
                        <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] opacity-45 border border-transparent select-none"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                            link.active
                                ? "admin-pill-active font-semibold"
                                : "admin-btn-ghost"
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
