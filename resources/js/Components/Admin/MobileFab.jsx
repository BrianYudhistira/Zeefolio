import { HiOutlinePlus } from "react-icons/hi2";

export default function MobileFab({
    onClick,
    label = "Add",
    hideAbove = "sm",
}) {
    const visibilityClass = hideAbove === "lg" ? "lg:hidden" : "sm:hidden";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`admin-btn-primary admin-fab fixed bottom-5 right-5 z-30 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${visibilityClass}`}
        >
            <HiOutlinePlus className="w-6 h-6" aria-hidden="true" />
            <span className="sr-only">{label}</span>
        </button>
    );
}
