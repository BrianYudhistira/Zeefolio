import { useRef, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import MobileFab from "@/Components/Admin/MobileFab";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import MemberStatsGrid from "@/Components/Admin/Members/MemberStatsGrid";
import MemberListCard from "@/Components/Admin/Members/MemberListCard";
import MemberDetailPanel from "@/Components/Admin/Members/MemberDetailPanel";
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
    const [mobileSection, setMobileSection] = useState("list");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const detailRef = useRef(null);

    const isSuperAdmin = currentUserRole === "superadmin";

    const form = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "member",
        status: "active",
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
        filteredMembers.find((m) => m.id === selectedId) ||
        filteredMembers[0] ||
        null;

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
        });
        setModalOpen(true);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();

        if (editingMember) {
            form.put(route("admin.members.update", editingMember.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset("password");
                },
            });
        } else {
            form.post(route("admin.members.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleSelectMember = (id) => {
        setSelectedId(id);
        setMobileSection("detail");
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            requestAnimationFrame(() => {
                detailRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        }
    };

    const handleRoleFilterChange = (nextRole) => {
        setRoleFilter(nextRole);
        setMobileSection("list");
    };

    const confirmDeleteAccount = () => {
        if (!memberToDelete) return;
        const deletedId = memberToDelete.id;
        setDeleting(true);

        router.delete(route("admin.members.destroy", deletedId), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedId === deletedId) {
                    const remaining = members.filter((m) => m.id !== deletedId);
                    setSelectedId(remaining[0]?.id || null);
                }
                setMemberToDelete(null);
                setMobileSection("list");
            },
            onFinish: () => setDeleting(false),
        });
    };

    const handlePromoteSkill = (skill) => {
        router.put(
            route("admin.members.skills.promote", skill.id),
            {},
            { preserveScroll: true }
        );
    };

    return (
        <>
            <Head title="Members & Accounts" />

            <div
                className={`space-y-4 sm:space-y-6 ${
                    mobileSection === "list" ? "pb-20 sm:pb-0" : ""
                }`}
            >
                <MemberStatsGrid
                    totalCount={members.length}
                    superAdminCount={superAdminCount}
                    adminCount={adminCount}
                    memberCount={memberCount}
                    activeFilter={roleFilter}
                    onFilterChange={handleRoleFilterChange}
                />

                {/* Mobile Master-Detail Switcher (< lg) */}
                <div
                    role="tablist"
                    aria-label="Account views"
                    className="lg:hidden admin-pill-track grid grid-cols-2 gap-1 p-1 rounded-xl border"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileSection === "list"}
                        onClick={() => setMobileSection("list")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer truncate ${
                            mobileSection === "list"
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
                        }`}
                    >
                        Accounts ({filteredMembers.length})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobileSection === "detail"}
                        onClick={() => setMobileSection("detail")}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer truncate ${
                            mobileSection === "detail"
                                ? "admin-pill-active"
                                : "admin-pill-inactive"
                        }`}
                    >
                        {selectedMember ? selectedMember.name : "Account Detail"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    <MemberListCard
                        members={filteredMembers}
                        availableRoles={availableRoles}
                        selectedId={selectedMember?.id}
                        onSelectMember={handleSelectMember}
                        roleFilter={roleFilter}
                        onRoleFilterChange={handleRoleFilterChange}
                        search={search}
                        onSearchChange={setSearch}
                        visibleOnMobile={mobileSection === "list"}
                        onCreateAccount={openCreateAccount}
                    />

                    <MemberDetailPanel
                        panelRef={detailRef}
                        selectedMember={selectedMember}
                        availableRoles={availableRoles}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onEditAccount={openEditAccount}
                        onDeleteAccount={setMemberToDelete}
                        onPromoteSkill={handlePromoteSkill}
                        visibleOnMobile={mobileSection === "detail"}
                    />
                </div>
            </div>

            {mobileSection === "list" && (
                <MobileFab onClick={openCreateAccount} label="New Account" />
            )}

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
        </>
    );
}

MembersIndex.layout = (page) => (
    <AdminLayout title="Members & Accounts">{page}</AdminLayout>
);
