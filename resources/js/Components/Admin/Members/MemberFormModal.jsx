import AdminModal from "@/Components/UI/AdminModal";
import { getRoleConfig } from "@/Utils/memberHelpers";

export default function MemberFormModal({
    open,
    editingMember,
    isSuperAdmin,
    availableRoles = [],
    form,
    onClose,
    onSubmit,
}) {
    const baseRoleOptions =
        availableRoles.length > 0
            ? availableRoles
            : [
                  { name: "member" },
                  { name: "admin" },
                  { name: "superadmin" },
              ];

    const roleOptions = isSuperAdmin
        ? baseRoleOptions
        : [{ name: form.data.role || "member" }];

    const selectedRoleInfo = getRoleConfig(form.data.role, availableRoles);

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={
                editingMember
                    ? `Configure Account — ${editingMember.name}`
                    : "Create New Account"
            }
            subtitle={
                isSuperAdmin
                    ? "Manage account credentials, role assignment, and status."
                    : "Manage member account credentials and status."
            }
            maxWidthClass="max-w-lg"
            preventClose={form.processing}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
                <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-name"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Full Name
                            </label>
                            <input
                                id="member-name"
                                type="text"
                                required
                                autoComplete="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                                placeholder="e.g. John Doe"
                                aria-invalid={Boolean(form.errors.name)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {form.errors.name && (
                                <p className="text-xs text-red-400">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-username"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Username
                            </label>
                            <input
                                id="member-username"
                                type="text"
                                required
                                autoComplete="username"
                                value={form.data.username}
                                onChange={(e) =>
                                    form.setData("username", e.target.value)
                                }
                                placeholder="e.g. johndoe"
                                aria-invalid={Boolean(form.errors.username)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {form.errors.username && (
                                <p className="text-xs text-red-400">
                                    {form.errors.username}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-email"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Email Address
                            </label>
                            <input
                                id="member-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData("email", e.target.value)
                                }
                                placeholder="user@example.com"
                                aria-invalid={Boolean(form.errors.email)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {form.errors.email && (
                                <p className="text-xs text-red-400">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-password"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                {editingMember
                                    ? "New Password (Optional)"
                                    : "Password"}
                            </label>
                            <input
                                id="member-password"
                                type="password"
                                required={!editingMember}
                                autoComplete="new-password"
                                minLength={editingMember ? undefined : 8}
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData("password", e.target.value)
                                }
                                placeholder={
                                    editingMember
                                        ? "Leave blank to keep current"
                                        : "Min. 8 characters"
                                }
                                aria-invalid={Boolean(form.errors.password)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {form.errors.password && (
                                <p className="text-xs text-red-400">
                                    {form.errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-role"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Role
                            </label>
                            <select
                                id="member-role"
                                value={form.data.role}
                                disabled={
                                    !isSuperAdmin ||
                                    (editingMember &&
                                        !editingMember.can_change_role)
                                }
                                onChange={(e) =>
                                    form.setData("role", e.target.value)
                                }
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border disabled:opacity-50 outline-none capitalize transition-colors"
                            >
                                {roleOptions.map((r) => (
                                    <option key={r.name} value={r.name}>
                                        {
                                            getRoleConfig(
                                                r.name,
                                                availableRoles
                                            ).label
                                        }
                                    </option>
                                ))}
                            </select>
                            {form.errors.role && (
                                <p className="text-xs text-red-400">
                                    {form.errors.role}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-status"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Account Status
                            </label>
                            <select
                                id="member-status"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData("status", e.target.value)
                                }
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="dnd">
                                    Do Not Disturb (DND)
                                </option>
                                <option value="banned">
                                    Suspended (Banned)
                                </option>
                            </select>
                            {form.errors.status && (
                                <p className="text-xs text-red-400">
                                    {form.errors.status}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400">
                        <span className="font-medium text-zinc-200 capitalize">
                            {selectedRoleInfo.label}:{" "}
                        </span>
                        {selectedRoleInfo.description}
                    </div>
                </div>

                <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={onClose}
                        className="admin-btn-secondary admin-btn-md inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="admin-btn-primary admin-btn-md inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {form.processing
                            ? "Saving..."
                            : editingMember
                              ? "Save Changes"
                              : "Create Account"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
