import { HiOutlinePlus } from "react-icons/hi2";

export default function EmptyState({
    icon: Icon = null,
    title = null,
    description = null,
    message = "No items found.",
    actionLabel,
    onAction,
}) {
    const bodyText = description || (!title ? message : null);

    return (
        <div className="py-10 sm:py-12 px-4 text-center space-y-2.5">
            {Icon && (
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center admin-well border text-[var(--text-muted)]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
            )}
            {title && (
                <p className="text-sm font-medium text-[var(--text)]">
                    {title}
                </p>
            )}
            {bodyText && (
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    {bodyText}
                </p>
            )}
            {actionLabel && onAction && (
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={onAction}
                        className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>{actionLabel}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

