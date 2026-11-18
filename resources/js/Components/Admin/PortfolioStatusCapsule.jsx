import { HiOutlineGlobeAlt } from "react-icons/hi2";

export default function PortfolioStatusCapsule({
    isActive = false,
    slug = null,
}) {
    return (
        <div className="admin-header-capsule inline-flex items-center h-8 rounded-full p-0.5 gap-0.5">
            <span
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] sm:text-xs font-medium ${
                    isActive ? "admin-status-active" : "admin-status-draft"
                }`}
            >
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                        backgroundColor: isActive
                            ? "var(--success)"
                            : "var(--text-muted)",
                    }}
                />
                {isActive ? "Active" : "Draft"}
            </span>

            {slug && (
                <a
                    href={route("portfolio.index", { slug })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-capsule-action group inline-flex items-center gap-1.5 h-7 px-2.5 sm:px-3 rounded-full font-medium text-xs transition-colors"
                >
                    <HiOutlineGlobeAlt className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
                    <span className="sm:hidden">Live</span>
                    <span className="hidden sm:inline">Live Site</span>
                </a>
            )}
        </div>
    );
}
