import { HiXMark, HiOutlineCheck } from "react-icons/hi2";
import { getRoleConfig } from "@/Components/Admin/Members/MemberStatsGrid";

export default function PermissionFormModal({
    open,
    editingPermission,
    roles = [],
    permissionGroups = [],
    form,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const toggleRole = (roleName) => {
        if (roleName === "superadmin") return;
        const current = form.data.roles || [];
        if (current.includes(roleName)) {
            form.setData(
                "roles",
                current.filter((r) => r !== roleName)
            );
        } else {
            form.setData("roles", [...current, roleName]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">
                            {editingPermission
                                ? `Edit Permission — ${editingPermission.name}`
                                : "Create New Permission"}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Add a permission key in the dashboard without running a seeder.
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

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Permission Key (Identifier)
                        </label>
                        <input
                            type="text"
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            placeholder="e.g. articles.publish, reports.export"
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none font-mono"
                        />
                        {form.errors.name && (
                            <p className="text-xs text-red-400">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Module / Group
                        </label>
                        <input
                            type="text"
                            list="permission-groups-list"
                            value={form.data.group}
                            onChange={(e) =>
                                form.setData("group", e.target.value)
                            }
                            placeholder="e.g. Portfolio, Administration, Access Control"
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        <datalist id="permission-groups-list">
                            {permissionGroups.map((grp) => (
                                <option key={grp} value={grp} />
                            ))}
                        </datalist>
                        {form.errors.group && (
                            <p className="text-xs text-red-400">
                                {form.errors.group}
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
                            placeholder="Explain what this permission controls..."
                            className="w-full text-sm px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none"
                        />
                        {form.errors.description && (
                            <p className="text-xs text-red-400">
                                {form.errors.description}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-300">
                            Assign to Roles
                        </label>
                        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                            {roles.map((role) => {
                                const isSuper = role.name === "superadmin";
                                const selected =
                                    isSuper ||
                                    (form.data.roles || []).includes(role.name);
                                const cfg = getRoleConfig(role.name, roles);

                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        disabled={isSuper}
                                        onClick={() => toggleRole(role.name)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                            selected
                                                ? "bg-zinc-800 text-zinc-100 border-emerald-500/40"
                                                : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                                        } ${
                                            isSuper
                                                ? "opacity-75 cursor-not-allowed"
                                                : "cursor-pointer"
                                        }`}
                                    >
                                        {selected && (
                                            <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                        <span>{cfg.label}</span>
                                    </button>
                                );
                            })}
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
                                : editingPermission
                                  ? "Save Permission"
                                  : "Create Permission"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

