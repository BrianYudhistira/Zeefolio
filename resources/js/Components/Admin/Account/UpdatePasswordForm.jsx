import { HiOutlineLockClosed } from "react-icons/hi2";

export default function UpdatePasswordForm({ passwordForm, onSubmit }) {
    return (
        <form
            onSubmit={onSubmit}
            className="admin-card rounded-xl border p-4 sm:p-6 space-y-4"
        >
            <div className="flex items-center gap-2">
                <HiOutlineLockClosed className="w-4 h-4 text-[var(--amber)]" />
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                        Change Password
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                        Use a strong password with at least 8 characters.
                    </p>
                </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="password-current"
                        className="block text-xs font-medium text-zinc-300"
                    >
                        Current Password
                    </label>
                    <input
                        id="password-current"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={passwordForm.data.current_password}
                        onChange={(e) =>
                            passwordForm.setData(
                                "current_password",
                                e.target.value
                            )
                        }
                        placeholder="Enter current password"
                        aria-invalid={Boolean(
                            passwordForm.errors.current_password
                        )}
                        className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors"
                    />
                    {passwordForm.errors.current_password && (
                        <p className="text-xs text-red-400">
                            {passwordForm.errors.current_password}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="password-new"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            New Password
                        </label>
                        <input
                            id="password-new"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={passwordForm.data.password}
                            onChange={(e) =>
                                passwordForm.setData(
                                    "password",
                                    e.target.value
                                )
                            }
                            placeholder="Min. 8 characters"
                            aria-invalid={Boolean(passwordForm.errors.password)}
                            className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors"
                        />
                        {passwordForm.errors.password && (
                            <p className="text-xs text-red-400">
                                {passwordForm.errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="password-confirm"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="password-confirm"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) =>
                                passwordForm.setData(
                                    "password_confirmation",
                                    e.target.value
                                )
                            }
                            placeholder="Repeat new password"
                            aria-invalid={Boolean(
                                passwordForm.errors.password_confirmation
                            )}
                            className="admin-input w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border outline-none transition-colors"
                        />
                        {passwordForm.errors.password_confirmation && (
                            <p className="text-xs text-red-400">
                                {passwordForm.errors.password_confirmation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-1 flex justify-end">
                <button
                    type="submit"
                    disabled={passwordForm.processing}
                    className="admin-btn-secondary admin-btn-lg inline-flex items-center justify-center w-full sm:w-auto font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {passwordForm.processing
                        ? "Updating..."
                        : "Update Password"}
                </button>
            </div>
        </form>
    );
}
