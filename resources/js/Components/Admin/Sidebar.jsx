import { Link } from "@inertiajs/react";
import {
    HiOutlineSquares2X2,
    HiOutlineFolderOpen,
    HiOutlineUserCircle,
    HiOutlineBell,
    HiOutlineHome,
    HiOutlineCpuChip,
    HiOutlineBriefcase,
    HiOutlineEnvelope,
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiXMark,
} from "react-icons/hi2";

export default function Sidebar({
    appName = "Zeefolio",
    user = null,
    sidebarOpen = false,
    onClose,
}) {
    const isSuperAdmin = user?.role === "superadmin";
    const perms = Array.isArray(user?.permission_names)
        ? user.permission_names
        : [];
    const hasPerm = (permission) => isSuperAdmin || perms.includes(permission);

    const navGroups = [
        {
            items: [
                hasPerm("dashboard.view") && {
                    name: "Dashboard",
                    href: route("admin.dashboard"),
                    active: route().current("admin.dashboard"),
                    icon: HiOutlineSquares2X2,
                },
            ].filter(Boolean),
        },
        {
            label: "Portfolio Content",
            items: [
                hasPerm("home.manage") && {
                    name: "Home & Profile",
                    href: route("admin.home.index"),
                    active: route().current("admin.home.*"),
                    icon: HiOutlineHome,
                },
                hasPerm("projects.manage") && {
                    name: "Projects",
                    href: route("admin.projects.index"),
                    active: route().current("admin.projects.*"),
                    icon: HiOutlineFolderOpen,
                },
                hasPerm("skills.manage") && {
                    name: "Skills",
                    href: route("admin.skills.index"),
                    active: route().current("admin.skills.*"),
                    icon: HiOutlineCpuChip,
                },
                hasPerm("experiences.manage") && {
                    name: "Experiences",
                    href: route("admin.experiences.index"),
                    active: route().current("admin.experiences.*"),
                    icon: HiOutlineBriefcase,
                },
                hasPerm("contacts.manage") && {
                    name: "Contact Info",
                    href: route("admin.contacts.index"),
                    active: route().current("admin.contacts.*"),
                    icon: HiOutlineEnvelope,
                },
            ].filter(Boolean),
        },
        {
            label: "Administration",
            items: [
                hasPerm("members.view") && {
                    name: "Members",
                    href: route("admin.members.index"),
                    active: route().current("admin.members.*"),
                    icon: HiOutlineUsers,
                },
                (hasPerm("roles.manage") || hasPerm("permissions.manage")) && {
                    name: "Roles & Permissions",
                    href: route("admin.roles.index"),
                    active:
                        route().current("admin.roles.*") ||
                        route().current("admin.permissions.*"),
                    icon: HiOutlineShieldCheck,
                },
                hasPerm("logs.view") && {
                    name: "Activity Logs",
                    href: route("admin.logs.index"),
                    active: route().current("admin.logs.*"),
                    icon: HiOutlineDocumentText,
                },
                hasPerm("settings.manage") && {
                    name: "Platform Settings",
                    href: route("admin.settings.index"),
                    active: route().current("admin.settings.*"),
                    icon: HiOutlineCog6Tooth,
                },
            ].filter(Boolean),
        },
        {
            label: "Account",
            items: [
                {
                    name: "Notifications",
                    href: route("admin.notifications.index"),
                    active: route().current("admin.notifications.*"),
                    icon: HiOutlineBell,
                },
                {
                    name: "Account Settings",
                    href: route("admin.account.index"),
                    active: route().current("admin.account.*"),
                    icon: HiOutlineUserCircle,
                },
            ],
        },
    ].filter((group) => group.items.length > 0);

    const brandSuffix =
        appName.toLowerCase() === "zeefolio" ? "eeFolio" : appName;

    const renderBody = (onNavigate) => (
        <div className="flex flex-col h-full mt-2">
            {/* Brand Header */}
            <div className="admin-sidebar-header h-14 px-5 flex items-center justify-between border-b shrink-0">
                <Link
                    href={route("admin.dashboard")}
                    onClick={onNavigate}
                    aria-label={appName}
                    className="admin-brand-link flex items-center font-semibold"
                >
                    <img
                        src="/images/web_icon.png"
                        alt=""
                        className="admin-brand-icon h-8 w-8 object-contain shrink-0"
                    />
                    <span className="admin-brand-text -ml-1.5 text-base tracking-tight leading-none">
                        {brandSuffix}
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
                    aria-label="Close Sidebar"
                >
                    <HiXMark className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label || "overview"} className="space-y-0.5">
                        {group.label && (
                            <p className="admin-sidebar-label px-3 pb-1 text-[11px] font-medium">
                                {group.label}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onNavigate}
                                    data-active={item.active ? "true" : undefined}
                                    className={`admin-nav-item group flex items-center px-3 py-1.5 rounded-lg text-[13px] transition-colors border ${item.active
                                        ? "font-medium"
                                        : "border-transparent"
                                        }`}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Icon className="admin-nav-icon w-4 h-4 transition-colors" />
                                        <span>{item.name}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="admin-sidebar hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-30 border-r">
                {renderBody()}
            </aside>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <aside className="admin-sidebar-mobile relative z-10 w-64 max-w-[85vw] h-full border-r">
                        {renderBody(onClose)}
                    </aside>
                </div>
            )}
        </>
    );
}

