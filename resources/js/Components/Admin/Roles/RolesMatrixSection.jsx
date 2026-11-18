import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    HiOutlineShieldCheck,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineUsers,
    HiOutlineKey,
    HiOutlineCheck,
    HiOutlineLockClosed,
} from "react-icons/hi2";
import { getRoleConfig } from "@/Utils/roleHelpers";
import { notifyAdmin } from "@/Utils/notify";

export default function RolesMatrixSection({
    roles = [],
    permissions = [],
    selectedRole,
    onSelectRole,
    onOpenCreateRole,
    onOpenEditRole,
    onDeleteRole,
}) {
    const [selectedPerms, setSelectedPerms] = useState([]);
    const [savingMatrix, setSavingMatrix] = useState(false);

    useEffect(() => {
        if (selectedRole) {
            setSelectedPerms(selectedRole.permissions || []);
        }
    }, [selectedRole]);

    const groupedPermissions = permissions.reduce((acc, perm) => {
        const grp = perm.group || "General";
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(perm);
        return acc;
    }, {});

    const isSuperAdminRole = selectedRole?.name === "superadmin";

    const hasUnsavedChanges = (() => {
        if (!selectedRole) return false;
        const orig = new Set(selectedRole.permissions || []);
        if (orig.size !== selectedPerms.length) return true;
        return selectedPerms.some((p) => !orig.has(p));
    })();

    const togglePermission = (permName) => {
        if (isSuperAdminRole) return;
        setSelectedPerms((prev) =>
            prev.includes(permName)
                ? prev.filter((p) => p !== permName)
                : [...prev, permName]
        );
    };

    const toggleGroup = (groupPerms) => {
        if (isSuperAdminRole) return;
        const names = groupPerms.map((p) => p.name);
        const allSelected = names.every((n) => selectedPerms.includes(n));

        if (allSelected) {
            setSelectedPerms((prev) => prev.filter((p) => !names.includes(p)));
        } else {
            setSelectedPerms((prev) =>
                Array.from(new Set([...prev, ...names]))
            );
        }
    };

    const handleSaveMatrix = () => {
        if (!selectedRole || isSuperAdminRole) return;
        setSavingMatrix(true);

        router.put(
            route("admin.roles.update", selectedRole.id),
            {
                name: selectedRole.name,
                description: selectedRole.description,
                permissions: selectedPerms,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingMatrix(false);
                    notifyAdmin({
                        type: "success",
                        title: "Permissions Updated",
                        message: `Updated permissions for role "${selectedRole.name}".`,
                    });
                },
                onFinish: () => setSavingMatrix(false),
            }
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left Column: Roles List */}
            <div className="lg:col-span-4 rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <HiOutlineShieldCheck className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">
                            Roles ({roles.length})
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onOpenCreateRole}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                        <span>New Role</span>
                    </button>
                </div>

                <div className="divide-y divide-zinc-800">
                    {roles.map((role) => {
                        const isSelected = selectedRole?.id === role.id;
                        const roleCfg = getRoleConfig(role.name, roles);

                        return (
                            <div
                                key={role.id}
                                onClick={() => onSelectRole(role)}
                                className={`p-3.5 sm:p-4 transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-zinc-800/80"
                                        : "hover:bg-zinc-800/30"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded border text-[11px] font-medium ${roleCfg.badgeClass}`}
                                            >
                                                {roleCfg.label}
                                            </span>
                                            <span className="text-[11px] font-mono text-zinc-500">
                                                {role.name}
                                            </span>
                                            {role.is_system ? (
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                                                    System
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                        {role.description && (
                                            <p className="text-xs text-zinc-400 line-clamp-2">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>

                                    <div
                                        className="flex items-center gap-1 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onOpenEditRole(role)}
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            title="Edit role"
                                        >
                                            <HiOutlinePencilSquare className="w-4 h-4" />
                                        </button>
                                        {!role.is_system && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDeleteRole(role)
                                                }
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Delete custom role"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-zinc-500">
                                    <span className="inline-flex items-center gap-1">
                                        <HiOutlineUsers className="w-3.5 h-3.5" />
                                        <span>
                                            {role.users_count}{" "}
                                            {role.users_count === 1
                                                ? "user"
                                                : "users"}
                                        </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <HiOutlineKey className="w-3.5 h-3.5" />
                                        <span>
                                            {role.name === "superadmin"
                                                ? `All (${permissions.length})`
                                                : role.permissions?.length ||
                                                  0}{" "}
                                            permissions
                                        </span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Interactive Permission Assignment Matrix */}
            <div className="lg:col-span-8 rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                {!selectedRole ? (
                    <div className="p-12 text-center text-xs text-zinc-500">
                        Select a role on the left to configure its permissions.
                    </div>
                ) : (
                    <>
                        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-zinc-100 capitalize">
                                        Permissions for{" "}
                                        {
                                            getRoleConfig(
                                                selectedRole.name,
                                                roles
                                            ).label
                                        }
                                    </h3>
                                    <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                                        {isSuperAdminRole
                                            ? `${permissions.length} / ${permissions.length}`
                                            : `${selectedPerms.length} / ${permissions.length}`}{" "}
                                        assigned
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {isSuperAdminRole
                                        ? "Super Admin automatically has unrestricted access to all permissions via Gate::before."
                                        : "Check or uncheck permissions below and click Save Permissions to apply changes immediately."}
                                </p>
                            </div>

                            {!isSuperAdminRole && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedPerms(
                                                permissions.map((p) => p.name)
                                            )
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPerms([])}
                                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 transition-colors cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        disabled={
                                            savingMatrix || !hasUnsavedChanges
                                        }
                                        onClick={handleSaveMatrix}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <HiOutlineCheck className="w-4 h-4" />
                                        <span>
                                            {savingMatrix
                                                ? "Saving..."
                                                : "Save Permissions"}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-5 space-y-5">
                            {Object.entries(groupedPermissions).map(
                                ([groupName, groupPerms]) => {
                                    const allChecked = groupPerms.every(
                                        (p) =>
                                            isSuperAdminRole ||
                                            selectedPerms.includes(p.name)
                                    );

                                    return (
                                        <div
                                            key={groupName}
                                            className="rounded-xl bg-zinc-950/70 border border-zinc-800/90 p-3.5 sm:p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                                                        {groupName}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-500">
                                                        ({groupPerms.length})
                                                    </span>
                                                </div>
                                                {!isSuperAdminRole && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleGroup(
                                                                groupPerms
                                                            )
                                                        }
                                                        className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                                                    >
                                                        {allChecked
                                                            ? "Unselect group"
                                                            : "Select group"}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {groupPerms.map((perm) => {
                                                    const checked =
                                                        isSuperAdminRole ||
                                                        selectedPerms.includes(
                                                            perm.name
                                                        );

                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            onClick={() =>
                                                                togglePermission(
                                                                    perm.name
                                                                )
                                                            }
                                                            className={`p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                                                                isSuperAdminRole
                                                                    ? "bg-zinc-900/50 border-zinc-800/80 opacity-80 cursor-not-allowed"
                                                                    : checked
                                                                      ? "bg-zinc-900 border-emerald-500/35 cursor-pointer"
                                                                      : "bg-zinc-900/30 border-zinc-800/70 hover:border-zinc-700 cursor-pointer"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                                                                    checked
                                                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                                                        : "bg-zinc-950 border-zinc-700 text-transparent"
                                                                }`}
                                                            >
                                                                {isSuperAdminRole ? (
                                                                    <HiOutlineLockClosed className="w-3 h-3 text-amber-300" />
                                                                ) : (
                                                                    <HiOutlineCheck className="w-3 h-3" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-mono font-medium text-zinc-100 truncate">
                                                                    {perm.name}
                                                                </p>
                                                                {perm.description && (
                                                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                                                                        {
                                                                            perm.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

