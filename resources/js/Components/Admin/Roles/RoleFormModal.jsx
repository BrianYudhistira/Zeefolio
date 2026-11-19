import { HiOutlineCheck } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";
import {
    groupPermissions,
    togglePermissionList,
} from "@/Utils/permissionHelpers";

export default function RoleFormModal({
    open,
    editingRole,
    permissions = [],
    form,
    onClose,
    onSubmit,
}) {
    const isSystem = Boolean(editingRole?.is_system);
    const isSuperAdmin = editingRole?.name === "superadmin";
    const groupedPermissions = groupPermissions(permissions);

    const togglePerm = (permName) => {
        if (isSuperAdmin) return;
        form.setData(
            "permissions",
            togglePermissionList(form.data.permissions || [], permName)
        );
    };

    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={
                editingRole
                    ? `Edit Role — ${editingRole.name}`
                    : "Create New Role"
            }
            subtitle="Set up a role and choose which features it can access."
            maxWidthClass="max-w-2xl"
            preventClose={form.processing}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="role-name"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Role Name
                            </label>
                            <input
                                id="role-name"
                                type="text"
                                required
                                disabled={isSystem}
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                                placeholder="e.g. editor, content_manager, reviewer"
                                aria-invalid={Boolean(form.errors.name)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border disabled:opacity-50 outline-none font-mono transition-colors"
                            />
                            {isSystem && (
                                <p className="text-[11px] text-zinc-500">
                                    System role identifiers cannot be renamed.
                                </p>
                            )}
                            {form.errors.name && (
                                <p className="text-xs text-red-400">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="role-description"
                                className="block text-xs font-medium text-zinc-300"
                            >
                                Description
                            </label>
                            <input
                                id="role-description"
                                type="text"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                                placeholder="Brief summary of what this role can do..."
                                aria-invalid={Boolean(form.errors.description)}
                                className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                            />
                            {form.errors.description && (
                                <p className="text-xs text-red-400">
                                    {form.errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <fieldset className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <legend className="text-xs font-medium text-zinc-300">
                                Assigned Permissions (
                                {isSuperAdmin
                                    ? permissions.length
                                    : (form.data.permissions || []).length}{" "}
                                / {permissions.length})
                            </legend>
                            {!isSuperAdmin && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData(
                                                "permissions",
                                                permissions.map((p) => p.name)
                                            )
                                        }
                                        className="px-2 py-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-zinc-700">•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData("permissions", [])
                                        }
                                        className="px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                            {Object.entries(groupedPermissions).map(
                                ([groupName, groupPerms]) => (
                                    <div key={groupName} className="space-y-1.5">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                            {groupName}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {groupPerms.map((perm) => {
                                                const checked =
                                                    isSuperAdmin ||
                                                    (
                                                        form.data.permissions ||
                                                        []
                                                    ).includes(perm.name);
                                                return (
                                                    <button
                                                        key={perm.id}
                                                        type="button"
                                                        disabled={isSuperAdmin}
                                                        aria-pressed={checked}
                                                        data-selected={
                                                            checked
                                                                ? "true"
                                                                : "false"
                                                        }
                                                        onClick={() =>
                                                            togglePerm(
                                                                perm.name
                                                            )
                                                        }
                                                        className={`admin-cat-chip text-left px-2.5 py-2 rounded-lg border text-xs flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] ${
                                                            isSuperAdmin
                                                                ? "opacity-75 cursor-not-allowed"
                                                                : "cursor-pointer"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                                                checked
                                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                                                    : "border-zinc-700"
                                                            }`}
                                                        >
                                                            {checked && (
                                                                <HiOutlineCheck className="w-2.5 h-2.5" />
                                                            )}
                                                        </span>
                                                        <span className="font-mono truncate">
                                                            {perm.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </fieldset>
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
                            : editingRole
                              ? "Save Changes"
                              : "Create Role"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
