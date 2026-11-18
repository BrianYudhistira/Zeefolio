import { HiOutlineTrash } from "react-icons/hi2";

export default function ConfirmDeleteModal({
    open,
    title = "Confirm Delete",
    description,
    itemName,
    confirmLabel = "Delete",
    processing = false,
    onClose,
    onConfirm,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => !processing && onClose?.()}
            />
            <div className="relative z-10 w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <HiOutlineTrash className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                            {title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {description ? (
                                description
                            ) : (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="text-zinc-200 font-medium">
                                        {itemName}
                                    </span>
                                    ?
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="admin-btn-secondary px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className="admin-btn-danger px-3.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

