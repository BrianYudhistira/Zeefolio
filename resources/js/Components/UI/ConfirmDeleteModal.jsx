import { HiOutlineTrash } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";

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
    return (
        <AdminModal
            open={open}
            onClose={onClose}
            role="alertdialog"
            maxWidthClass="max-w-sm"
            showCloseButton={false}
            preventClose={processing}
            panelClassName="p-5 space-y-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <HiOutlineTrash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                        {title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {description ? (
                            description
                        ) : itemName ? (
                            <>
                                Are you sure you want to delete{" "}
                                <span className="text-zinc-200 font-medium">
                                    {itemName}
                                </span>
                                ?
                            </>
                        ) : (
                            "Are you sure you want to delete this item?"
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    type="button"
                    disabled={processing}
                    onClick={onClose}
                    className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={processing}
                    onClick={onConfirm}
                    className="admin-btn-danger admin-btn-md inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {processing ? "Deleting..." : confirmLabel}
                </button>
            </div>
        </AdminModal>
    );
}
