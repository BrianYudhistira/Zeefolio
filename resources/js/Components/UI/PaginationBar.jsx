import { Link } from "@inertiajs/react";

function decodePaginationLabel(rawLabel) {
    const text = String(rawLabel ?? "");
    return text
        .replace(/&laquo;\s*Previous/i, "Prev")
        .replace(/Next\s*&raquo;/i, "Next")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&hellip;/g, "…")
        .replace(/&amp;/g, "&");
}

export default function PaginationBar({ links = [], standalone = false }) {
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className={
                standalone
                    ? "admin-card rounded-xl border px-4 py-3 flex flex-wrap items-center justify-center sm:justify-end gap-1.5"
                    : "px-4 py-3 border-t border-[var(--border)] flex flex-wrap items-center justify-center sm:justify-end gap-1.5 bg-[color-mix(in_srgb,var(--surface-elevated)_35%,var(--surface))]"
            }
        >
            {links.map((link, idx) => {
                const label = decodePaginationLabel(link.label);
                const baseSize =
                    "min-w-[36px] h-9 sm:min-w-[32px] sm:h-8 px-2.5 inline-flex items-center justify-center rounded-lg text-xs border transition-colors tabular-nums";

                if (!link.url) {
                    return (
                        <span
                            key={`disabled-${idx}-${label}`}
                            aria-disabled="true"
                            className={`${baseSize} text-[var(--text-muted)] opacity-45 border-transparent select-none`}
                        >
                            {label}
                        </span>
                    );
                }

                if (link.active) {
                    return (
                        <span
                            key={`active-${idx}-${label}`}
                            aria-current="page"
                            className={`${baseSize} admin-pill-active font-semibold select-none`}
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`page-${idx}-${label}`}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`${baseSize} admin-btn-ghost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]`}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
