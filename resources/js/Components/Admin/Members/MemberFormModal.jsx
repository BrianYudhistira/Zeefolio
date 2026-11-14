import { HiXMark } from "react-icons/hi2";
import { getRoleConfig } from "./MemberStatsGrid";

export default function MemberFormModal({
    open,
    editingMember,
    isSuperAdmin,
    availableRoles = [],
    form,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const roleOptions =
        availableRoles.length > 0
            ? availableRoles
            : [
                  { name: "member" },
                  { name: "admin" },
                  { name: "superadmin" },
              ];

    const selectedRoleInfo = getRoleConfig(form.data.role, availableRoles);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-100 truncate">
                            {editingMember
                                ? `Configure Account — ${editingMember.name}`
                                : "Create New Account"}
                        </h3>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                            {isSuperAdmin
                                ? "Manage account credentials, role assignment, and status."
                                : "Manage member account credentials and status."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 cursor-pointer shrink-0"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                                placeholder="e.g. John Doe"
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {form.errors.name && (
                                <p className="text-xs text-red-400">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={form.data.username}
                                onChange={(e) =>
                                    form.setData("username", e.target.value)
                                }
                                placeholder="e.g. johndoe"
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
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
                            <label className="block text-xs font-medium text-zinc-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData("email", e.target.value)
                                }
                                placeholder="user@example.com"
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {form.errors.email && (
                                <p className="text-xs text-red-400">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                {editingMember
                                    ? "New Password (Optional)"
                                    : "Password"}
                            </label>
                            <input
                                type="password"
                                required={!editingMember}
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData("password", e.target.value)
                                }
                                placeholder={
                                    editingMember
                                        ? "Leave blank to keep current"
                                        : "Min. 8 characters"
                                }
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
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
                            <label className="block text-xs font-medium text-zinc-300">
                                Role
                            </label>
                            <select
                                value={form.data.role}
                                disabled={
                                    !isSuperAdmin ||
                                    (editingMember &&
                                        !editingMember.can_change_role)
                                }
                                onChange={(e) =>
                                    form.setData("role", e.target.value)
                                }
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 disabled:opacity-50 outline-none capitalize"
                            >
                                {isSuperAdmin ? (
                                    roleOptions.map((r) => (
                                        <option key={r.name} value={r.name}>
                                            {getRoleConfig(
                                                r.name,
                                                availableRoles
                                            ).label}
                                        </option>
                                    ))
                                ) : (
                                    <option value="member">Member</option>
                                )}
                            </select>
                            {form.errors.role && (
                                <p className="text-xs text-red-400">
                                    {form.errors.role}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Account Status
                            </label>
                            <select
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData("status", e.target.value)
                                }
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
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

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-medium text-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {form.processing
                                ? "Saving..."
                                : editingMember
                                  ? "Save Changes"
                                  : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
