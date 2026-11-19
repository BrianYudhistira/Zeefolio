import { HiOutlineCheck } from "react-icons/hi2";
import AdminModal from "@/Components/UI/AdminModal";
import { getRoleConfig } from "@/Utils/roleHelpers";

export default function PermissionFormModal({
    open,
    editingPermission,
    roles = [],
    permissionGroups = [],
    form,
    onClose,
    onSubmit,
}) {
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
        <AdminModal
            open={open}
            onClose={onClose}
            title={
                editingPermission
                    ? `Edit Permission — ${editingPermission.name}`
                    : "Create New Permission"
            }
            subtitle="Add a new access rule to assign to roles."
            maxWidthClass="max-w-md"
            preventClose={form.processing}
        >
            <form
                onSubmit={onSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="perm-name"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Permission Name
                        </label>
                        <input
                            id="perm-name"
                            type="text"
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            placeholder="e.g. articles.publish, reports.export"
                            aria-invalid={Boolean(form.errors.name)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none font-mono transition-colors"
                        />
                        {form.errors.name && (
                            <p className="text-xs text-red-400">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="perm-group"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Section / Group
                        </label>
                        <input
                            id="perm-group"
                            type="text"
                            list="permission-groups-list"
                            value={form.data.group}
                            onChange={(e) =>
                                form.setData("group", e.target.value)
                            }
                            placeholder="e.g. Portfolio, Administration, Access Control"
                            aria-invalid={Boolean(form.errors.group)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
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
                        <label
                            htmlFor="perm-description"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Description
                        </label>
                        <input
                            id="perm-description"
                            type="text"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                            placeholder="Describe what this allows a user to do..."
                            aria-invalid={Boolean(form.errors.description)}
                            className="admin-input w-full text-sm px-3.5 py-2 rounded-lg border outline-none transition-colors"
                        />
                        {form.errors.description && (
                            <p className="text-xs text-red-400">
                                {form.errors.description}
                            </p>
                        )}
                    </div>

                    <fieldset className="space-y-2">
                        <legend className="text-xs font-medium text-zinc-300">
                            Assign to Roles
                        </legend>
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
                                        aria-pressed={selected}
                                        data-selected={
                                            selected ? "true" : "false"
                                        }
                                        onClick={() => toggleRole(role.name)}
                                        className={`admin-cat-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] ${
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
                    </fieldset>
                </div>

                <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={form.processing}
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
                            : editingPermission
                              ? "Save Changes"
                              : "Create Permission"}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
}
