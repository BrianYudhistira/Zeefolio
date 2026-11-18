import { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    HiOutlinePlus,
    HiOutlineInformationCircle,
    HiOutlineShieldCheck,
} from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import MemberStatsGrid from "@/Components/Admin/Members/MemberStatsGrid";
import MemberListCard from "@/Components/Admin/Members/MemberListCard";
import MemberDetailSlideOver from "@/Components/Admin/Members/MemberDetailSlideOver";
import MemberFormModal from "@/Components/Admin/Members/MemberFormModal";

export default function MembersIndex({
    members = [],
    currentUserRole = "admin",
    availableRoles = [],
}) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedId, setSelectedId] = useState(members[0]?.id || null);
    const [activeTab, setActiveTab] = useState("account");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const isSuperAdmin = currentUserRole === "superadmin";

    const form = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "member",
        status: "active",
        bio: "",
    });

    const filteredMembers = members.filter((m) => {
        if (roleFilter !== "all" && m.role !== roleFilter) return false;
        const q = search.toLowerCase();
        return (
            m.name?.toLowerCase().includes(q) ||
            m.username?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q)
        );
    });

    const selectedMember =
        members.find((m) => m.id === selectedId) || filteredMembers[0] || null;

    const superAdminCount = members.filter(
        (m) => m.role === "superadmin"
    ).length;
    const adminCount = members.filter((m) => m.role === "admin").length;
    const memberCount = members.filter((m) => m.role === "member").length;

    const openCreateAccount = () => {
        setEditingMember(null);
        form.clearErrors();
        form.setData({
            name: "",
            username: "",
            email: "",
            password: "",
            role: "member",
            status: "active",
            bio: "",
        });
        setModalOpen(true);
    };

    const openEditAccount = (member) => {
        setEditingMember(member);
        form.clearErrors();
        form.setData({
            name: member.name || "",
            username: member.username || "",
            email: member.email || "",
            password: "",
            role: member.role || "member",
            status: member.status || "active",
            bio: member.bio || "",
        });
        setModalOpen(true);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();
        const accountName = form.data.name.trim() || "Account";

        if (editingMember) {
            form.put(route("admin.members.update", editingMember.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset("password");
                    notifyAdmin({
                        type: "success",
                        title: "Account Updated",
                        message: `Account "${accountName}" (${form.data.role}) has been updated.`,
                    });
                },
            });
        } else {
            form.post(route("admin.members.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                    notifyAdmin({
                        type: "success",
                        title: "Account Created",
                        message: `Account "${accountName}" (${form.data.role}) has been created.`,
                    });
                },
            });
        }
    };

    const confirmDeleteAccount = () => {
        if (!memberToDelete) return;
        const name = memberToDelete.name;
        setDeleting(true);

        router.delete(route("admin.members.destroy", memberToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedId === memberToDelete.id) {
                    const remaining = members.filter(
                        (m) => m.id !== memberToDelete.id
                    );
                    setSelectedId(remaining[0]?.id || null);
                }
                setMemberToDelete(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: `Account "${name}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    const handlePromoteSkill = (skill) => {
        router.put(
            route("admin.members.skills.promote", skill.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    notifyAdmin({
                        type: "success",
                        title: "Skill Promoted",
                        message: `Skill "${skill.name}" promoted to Default.`,
                    });
                },
            }
        );
    };

    return (
        <AdminLayout
            title="Members & Accounts"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openCreateAccount}
                        className="admin-btn-primary inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span className="sm:hidden">New</span>
                        <span className="hidden sm:inline">New Account</span>
                    </button>
                </div>
            }
        >
            <Head title="Members & Accounts - Zeefolio" />

            <div className="space-y-4 sm:space-y-6">
                <MemberStatsGrid
                    totalCount={members.length}
                    superAdminCount={superAdminCount}
                    adminCount={adminCount}
                    memberCount={memberCount}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    <MemberListCard
                        members={filteredMembers}
                        availableRoles={availableRoles}
                        selectedId={selectedMember?.id}
                        onSelectMember={setSelectedId}
                        roleFilter={roleFilter}
                        onRoleFilterChange={setRoleFilter}
                        search={search}
                        onSearchChange={setSearch}
                    />

                    <MemberDetailSlideOver
                        selectedMember={selectedMember}
                        availableRoles={availableRoles}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onEditAccount={openEditAccount}
                        onDeleteAccount={setMemberToDelete}
                        onPromoteSkill={handlePromoteSkill}
                    />
                </div>
            </div>

            <MemberFormModal
                open={modalOpen}
                editingMember={editingMember}
                isSuperAdmin={isSuperAdmin}
                availableRoles={availableRoles}
                form={form}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveAccount}
            />

            <ConfirmDeleteModal
                open={Boolean(memberToDelete)}
                title="Delete Account"
                description={
                    memberToDelete ? (
                        <>
                            Are you sure you want to permanently delete{" "}
                            <span className="text-zinc-200 font-medium">
                                {memberToDelete.name} (@
                                {memberToDelete.username})
                            </span>{" "}
                            and their entire portfolio?
                        </>
                    ) : null
                }
                confirmLabel="Delete Account"
                processing={deleting}
                onClose={() => setMemberToDelete(null)}
                onConfirm={confirmDeleteAccount}
            />
        </AdminLayout>
    );
}
