import {
    HiOutlineShieldExclamation,
    HiOutlineTrash,
    HiXMark,
} from "react-icons/hi2";

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
                    className="admin-btn-danger w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                    <span>Delete Account</span>
                </button>
            </div>

            {/* Delete Account Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-100">
                                Confirm Account Deletion
                            </h3>
                            <button
                                type="button"
                                onClick={onCloseModal}
                                className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                            >
                                <HiXMark className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={onSubmit}
                            className="p-4 sm:p-5 space-y-4"
                        >
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Once your account is deleted, all of your portfolio projects, skills, experiences, and profile data will be permanently removed. Please enter your current password to confirm.
                            </p>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-zinc-300">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    autoFocus
                                    value={deleteForm.data.password}
                                    onChange={(e) =>
                                        deleteForm.setData(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-red-500/50 text-zinc-100 outline-none"
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
                                    className="admin-btn-secondary px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {deleteForm.processing
                                        ? "Deleting..."
                                        : "Permanently Delete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
