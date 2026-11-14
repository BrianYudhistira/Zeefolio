import { HiXMark, HiOutlineCheck } from "react-icons/hi2";

export default function RoleFormModal({
    open,
    editingRole,
    permissions = [],
    form,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const isSystem = Boolean(editingRole?.is_system);
    const isSuperAdmin = editingRole?.name === "superadmin";

    const groupedPermissions = permissions.reduce((acc, perm) => {
        const grp = perm.group || "General";
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(perm);
        return acc;
    }, {});

    const togglePerm = (permName) => {
        if (isSuperAdmin) return;
        const current = form.data.permissions || [];
        if (current.includes(permName)) {
            form.setData(
                "permissions",
                current.filter((p) => p !== permName)
            );
        } else {
            form.setData("permissions", [...current, permName]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                            {editingRole
                                ? `Edit Role — ${editingRole.name}`
                                : "Create New Role"}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Define a Spatie role and choose which permissions it grants.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-5 space-y-4 overflow-y-auto flex-1"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-zinc-300">
                                Role Identifier (Slug)
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isSystem}
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                                placeholder="e.g. editor, content_manager, reviewer"
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 disabled:opacity-50 outline-none font-mono"
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
                            <label className="block text-xs font-medium text-zinc-300">
                                Description
                            </label>
                            <input
                                type="text"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                                placeholder="Brief summary of what this role can do..."
                                className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                            />
                            {form.errors.description && (
                                <p className="text-xs text-red-400">
                                    {form.errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-zinc-300">
                                Assigned Permissions (
                                {isSuperAdmin
                                    ? permissions.length
                                    : (form.data.permissions || []).length}{" "}
                                / {permissions.length})
                            </label>
                            {!isSuperAdmin && (
                                <div className="flex items-center gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData(
                                                "permissions",
                                                permissions.map((p) => p.name)
                                            )
                                        }
                                        className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-zinc-700">•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData("permissions", [])
                                        }
                                        className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
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
                                                        onClick={() =>
                                                            togglePerm(
                                                                perm.name
                                                            )
                                                        }
                                                        className={`text-left px-2.5 py-2 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                                                            checked
                                                                ? "bg-zinc-900 border-emerald-500/40 text-zinc-100"
                                                                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                                        } ${
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
                                : editingRole
                                  ? "Save Role"
                                  : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

