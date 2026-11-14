import { HiOutlinePlus } from "react-icons/hi2";

export default function EmptyState({
    message = "No items found.",
    actionLabel,
    onAction,
}) {
    return (
        <div className="py-12 text-center space-y-3">
            <p className="text-xs text-zinc-500">{message}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
}

