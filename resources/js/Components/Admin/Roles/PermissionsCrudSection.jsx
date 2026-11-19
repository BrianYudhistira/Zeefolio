import {
    HiOutlineKey,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";
import SearchInput from "@/Components/UI/SearchInput";
import EmptyState from "@/Components/UI/EmptyState";
import { getRoleConfig } from "@/Utils/roleHelpers";

export default function PermissionsCrudSection({
    permissions = [],
    roles = [],
    permissionGroups = [],
    search = "",
    onSearchChange,
    selectedGroup = "all",
    onGroupChange,
    onOpenCreatePermission,
    onOpenEditPermission,
    onDeletePermission,
}) {
    const filteredPermissions = permissions.filter((perm) => {
        if (selectedGroup !== "all" && perm.group !== selectedGroup) {
            return false;
        }
        const q = search.toLowerCase();
        return (
            perm.name?.toLowerCase().includes(q) ||
            perm.group?.toLowerCase().includes(q) ||
            perm.description?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="admin-card rounded-xl border overflow-hidden">
            {/* Filter & Action Header */}
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="admin-scroll-strip flex items-center gap-1.5 overflow-x-auto min-w-0 pb-2.5 sm:pb-2 sm:-mb-2">
                    <button
                        type="button"
                        aria-pressed={selectedGroup === "all"}
                        onClick={() => onGroupChange("all")}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                            selectedGroup === "all"
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
                        }`}
                    >
                        All Groups ({permissions.length})
                    </button>
                    {permissionGroups.map((grp) => (
                        <button
                            key={grp}
                            type="button"
                            aria-pressed={selectedGroup === grp}
                            onClick={() => onGroupChange(grp)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                                selectedGroup === grp
                                    ? "admin-pill-active"
                                    : "admin-pill-inactive"
                            }`}
                        >
                            {grp}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder="Search permissions..."
                        className="flex-1 sm:w-60"
                    />
                    <button
                        type="button"
                        onClick={onOpenCreatePermission}
                        className="admin-btn-primary admin-btn-sm hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                        <HiOutlinePlus className="w-4 h-4 shrink-0" />
                        <span>New Permission</span>
                    </button>
                </div>
            </div>

            {filteredPermissions.length === 0 ? (
                <EmptyState
                    message="No permissions match your filter criteria."
                    actionLabel="New Permission"
                    onAction={onOpenCreatePermission}
                />
            ) : (
                <div className="divide-y divide-zinc-800">
                    {filteredPermissions.map((perm) => (
                        <div
                            key={perm.id}
                            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
                        >
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs font-mono font-semibold text-emerald-300 break-all max-w-full">
                                        <HiOutlineKey className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        {perm.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-[10px] font-medium text-zinc-300">
                                        {perm.group}
                                    </span>
                                </div>
                                {perm.description && (
                                    <p className="text-xs text-zinc-400">
                                        {perm.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="text-[10px] text-zinc-500">
                                        Assigned to:
                                    </span>
                                    {(perm.roles || []).map((roleName) => {
                                        const cfg = getRoleConfig(
                                            roleName,
                                            roles
                                        );
                                        return (
                                            <span
                                                key={roleName}
                                                className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${cfg.badgeClass}`}
                                            >
                                                {cfg.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onOpenEditPermission(perm)}
                                    className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Edit permission"
                                    aria-label={`Edit permission ${perm.name}`}
                                >
                                    <HiOutlinePencilSquare className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeletePermission(perm)}
                                    className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    title="Delete permission"
                                    aria-label={`Delete permission ${perm.name}`}
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

