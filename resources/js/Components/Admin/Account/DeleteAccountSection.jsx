import {
    HiOutlineShieldExclamation,
    HiOutlineTrash,
} from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";

export default function DeleteAccountSection({
    deleteForm,
    deleteModalOpen,
    onOpenModal,
    onCloseModal,
    onSubmit,
}) {
    return (
        <>
            {/* Danger Zone: Delete Account */}
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--danger)_6%,var(--surface))] border border-[color-mix(in_srgb,var(--danger)_24%,var(--border))] p-4 sm:p-6 flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                        <HiOutlineShieldExclamation className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-red-200">
                            Delete Account
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Permanently delete your account, profile photo, and all associated portfolio data. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenModal}
                    className="admin-btn-danger admin-btn-lg w-full sm:w-auto lg:w-full inline-flex items-center justify-center font-semibold transition-colors cursor-pointer shrink-0"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                    <span>Delete Account</span>
                </button>
            </div>

            {/* Delete Account Confirmation Modal */}
            <AdminModal
                open={deleteModalOpen}
                onClose={onCloseModal}
                title="Confirm Account Deletion"
                role="alertdialog"
                maxWidthClass="max-w-md"
                preventClose={deleteForm.processing}
            >
                <form
                    onSubmit={onSubmit}
                    className="p-4 sm:p-5 space-y-4 overflow-y-auto"
                >
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Once your account is deleted, all of your portfolio projects, skills, experiences, and profile data will be permanently removed. Please enter your current password to confirm.
                    </p>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="delete-account-password"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Current Password
                        </label>
                        <input
                            id="delete-account-password"
                            type="password"
                            required
                            autoFocus
                            autoComplete="current-password"
                            value={deleteForm.data.password}
                            onChange={(e) =>
                                deleteForm.setData("password", e.target.value)
                            }
                            placeholder="Enter your password"
                            aria-invalid={Boolean(deleteForm.errors.password)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border focus:border-red-500/50 outline-none transition-colors"
                        />
                        {deleteForm.errors.password && (
                            <p className="text-xs text-red-400">
                                {deleteForm.errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            disabled={deleteForm.processing}
                            onClick={onCloseModal}
                            className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={deleteForm.processing}
                            className="admin-btn-danger admin-btn-md inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {deleteForm.processing
                                ? "Deleting..."
                                : "Delete Account"}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </>
    );
}
