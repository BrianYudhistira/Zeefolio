import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlinePlus,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import RolesMatrixSection from "@/Components/Admin/Roles/RolesMatrixSection";
import RoleFormModal from "@/Components/Admin/Roles/RoleFormModal";
import PermissionsCrudSection from "@/Components/Admin/Roles/PermissionsCrudSection";
import PermissionFormModal from "@/Components/Admin/Roles/PermissionFormModal";

export default function RolesPermissionsIndex({
    roles = [],
    permissions = [],
    permissionGroups = [],
}) {
    const [activeSection, setActiveSection] = useState("roles"); // "roles" | "permissions"
    const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || null);

    // Role Modal State
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Permission Search/Filter & Modal State
    const [permSearch, setPermSearch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [permModalOpen, setPermModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);

    // Delete Confirmation State
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: "role" | "permission", item }
    const [deleting, setDeleting] = useState(false);

    const selectedRole =
        roles.find((r) => r.id === selectedRoleId) || roles[0] || null;

    const roleForm = useForm({
        name: "",
        description: "",
        permissions: [],
    });

    const permForm = useForm({
        name: "",
        group: "",
        description: "",
        roles: ["superadmin"],
    });

    const openCreateRole = () => {
        setEditingRole(null);
        roleForm.clearErrors();
        roleForm.setData({
            name: "",
            description: "",
            permissions: [
                "dashboard.view",
                "profile.manage",
                "projects.manage",
                "skills.manage",
                "experiences.manage",
            ],
        });
        setRoleModalOpen(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        roleForm.clearErrors();
        roleForm.setData({
            name: role.name || "",
            description: role.description || "",
            permissions: role.permissions || [],
        });
        setRoleModalOpen(true);
    };

    const handleSaveRole = (e) => {
        e.preventDefault();
        const roleName = roleForm.data.name.trim();

        if (editingRole) {
            roleForm.put(route("admin.roles.update", editingRole.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setRoleModalOpen(false);
                    notifyAdmin({
                        type: "success",
                        title: "Role Updated",
                        message: `Role "${roleName}" has been updated.`,
                    });
                },
            });
        } else {
            roleForm.post(route("admin.roles.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setRoleModalOpen(false);
                    roleForm.reset();
                    notifyAdmin({
                        type: "success",
                        title: "Role Created",
                        message: `Role "${roleName}" has been created.`,
                    });
                },
            });
        }
    };

    const openCreatePermission = () => {
        setEditingPermission(null);
        permForm.clearErrors();
        permForm.setData({
            name: "",
            group: selectedGroup !== "all" ? selectedGroup : "Portfolio",
            description: "",
            roles: ["superadmin"],
        });
        setPermModalOpen(true);
    };

    const openEditPermission = (perm) => {
        setEditingPermission(perm);
        permForm.clearErrors();
        permForm.setData({
            name: perm.name || "",
            group: perm.group || "",
            description: perm.description || "",
            roles: perm.roles || ["superadmin"],
        });
        setPermModalOpen(true);
    };

    const handleSavePermission = (e) => {
        e.preventDefault();
        const permName = permForm.data.name.trim();

        if (editingPermission) {
            permForm.put(
                route("admin.permissions.update", editingPermission.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setPermModalOpen(false);
                        notifyAdmin({
                            type: "success",
                            title: "Permission Updated",
                            message: `Permission "${permName}" has been updated.`,
                        });
                    },
                }
            );
        } else {
            permForm.post(route("admin.permissions.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setPermModalOpen(false);
                    permForm.reset();
                    notifyAdmin({
                        type: "success",
                        title: "Permission Created",
                        message: `Permission "${permName}" has been created.`,
                    });
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);

        const isRole = deleteTarget.type === "role";
        const itemName = deleteTarget.item.name;
        const targetRoute = isRole
            ? route("admin.roles.destroy", deleteTarget.item.id)
            : route("admin.permissions.destroy", deleteTarget.item.id);

        router.delete(targetRoute, {
            preserveScroll: true,
            onSuccess: () => {
                if (isRole && selectedRoleId === deleteTarget.item.id) {
                    setSelectedRoleId(roles[0]?.id || null);
                }
                setDeleteTarget(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: isRole
                        ? `Custom role "${itemName}" has been deleted.`
                        : `Permission "${itemName}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AdminLayout
            title="Roles & Permissions"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openCreatePermission}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlineKey className="w-4 h-4 text-emerald-400" />
                        <span className="sm:hidden">+ Perm</span>
                        <span className="hidden sm:inline">
                            New Permission
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={openCreateRole}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span className="sm:hidden">+ Role</span>
                        <span className="hidden sm:inline">New Role</span>
                    </button>
                </div>
            }
        >
            <Head title="Roles & Permissions - Zeefolio" />

            <div className="space-y-4 sm:space-y-6">
                {/* Summary Banner & Section Tabs */}
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/25 text-amber-300">
                                Spatie RBAC
                            </span>
                            <h2 className="text-xs sm:text-sm font-semibold text-zinc-100">
                                Role-Based Access Control & Permission Registry
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Create custom roles, configure granular permission matrices, and manually register new permissions without running database seeders.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveSection("roles")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                activeSection === "roles"
                                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                            }`}
                        >
                            <HiOutlineShieldCheck className="w-4 h-4" />
                            <span>Roles & Matrix ({roles.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection("permissions")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                activeSection === "permissions"
                                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                            }`}
                        >
                            <HiOutlineKey className="w-4 h-4" />
                            <span>Permissions CRUD ({permissions.length})</span>
                        </button>
                    </div>
                </div>

                {activeSection === "roles" ? (
                    <RolesMatrixSection
                        roles={roles}
                        permissions={permissions}
                        selectedRole={selectedRole}
                        onSelectRole={(r) => setSelectedRoleId(r.id)}
                        onOpenCreateRole={openCreateRole}
                        onOpenEditRole={openEditRole}
                        onDeleteRole={(r) =>
                            setDeleteTarget({ type: "role", item: r })
                        }
                    />
                ) : (
                    <PermissionsCrudSection
                        permissions={permissions}
                        roles={roles}
                        permissionGroups={permissionGroups}
                        search={permSearch}
                        onSearchChange={setPermSearch}
                        selectedGroup={selectedGroup}
                        onGroupChange={setSelectedGroup}
                        onOpenCreatePermission={openCreatePermission}
                        onOpenEditPermission={openEditPermission}
                        onDeletePermission={(p) =>
                            setDeleteTarget({ type: "permission", item: p })
                        }
                    />
                )}
            </div>

            <RoleFormModal
                open={roleModalOpen}
                editingRole={editingRole}
                permissions={permissions}
                form={roleForm}
                onClose={() => setRoleModalOpen(false)}
                onSubmit={handleSaveRole}
            />

            <PermissionFormModal
                open={permModalOpen}
                editingPermission={editingPermission}
                roles={roles}
                permissionGroups={permissionGroups}
                form={permForm}
                onClose={() => setPermModalOpen(false)}
                onSubmit={handleSavePermission}
            />

            <ConfirmDeleteModal
                open={Boolean(deleteTarget)}
                title={
                    deleteTarget?.type === "role"
                        ? "Delete Custom Role"
                        : "Delete Permission"
                }
                description={
                    deleteTarget ? (
                        deleteTarget.type === "role" ? (
                            <>
                                Are you sure you want to delete the custom role{" "}
                                <span className="text-zinc-200 font-medium">
                                    {deleteTarget.item.name}
                                </span>
                                ? Any accounts assigned to this role will be reassigned to the default{" "}
                                <span className="text-zinc-200 font-medium">
                                    member
                                </span>{" "}
                                role.
                            </>
                        ) : (
                            <>
                                Are you sure you want to delete permission{" "}
                                <span className="text-zinc-200 font-mono font-medium">
                                    {deleteTarget.item.name}
                                </span>
                                ? It will be detached from all roles.
                            </>
                        )
                    ) : null
                }
                confirmLabel="Delete"
                processing={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </AdminLayout>
    );
}

