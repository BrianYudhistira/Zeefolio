import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Link } from "@inertiajs/react";
import { useAdminTheme } from "@/Hooks/useAdminTheme";
import {
    getBrandSuffix,
    hasUserPermission,
} from "@/Utils/permissionHelpers";
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
    HiOutlineGlobeAlt,
    HiOutlineArrowTopRightOnSquare,
    HiXMark,
} from "react-icons/hi2";

export default function Sidebar({
    appName = "ZeeFolio",
    user = null,
    sidebarOpen = false,
    onClose,
}) {
    const { theme } = useAdminTheme();
    const hasPerm = (permission) => hasUserPermission(user, permission);
    const portfolioSlug = user?.portfolio_slug || user?.username || null;
    const isPortfolioActive = Boolean(user?.portfolio_is_active);

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

    const brandSuffix = getBrandSuffix(appName);
    const brandHref = hasPerm("dashboard.view")
        ? route("admin.dashboard")
        : navGroups[0]?.items[0]?.href || route("admin.account.index");

    const renderBody = (onNavigate) => (
        <div className="flex flex-col h-full pt-2">
            {/* Brand Header */}
            <div className="admin-sidebar-header flex items-center justify-between shrink-0">
                <Link
                    href={brandHref}
                    onClick={onNavigate}
                    aria-label={appName}
                    className="admin-brand-link flex items-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] rounded-lg"
                >
                    <img
                        src="/images/web_icon.png"
                        alt=""
                        className="admin-brand-icon object-contain shrink-0"
                    />
                    <span className="admin-brand-text tracking-tight leading-none">
                        {brandSuffix}
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                    aria-label="Close Sidebar"
                >
                    <HiXMark className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Groups */}
            <nav
                aria-label="Admin navigation"
                className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
            >
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
                                    aria-current={
                                        item.active ? "page" : undefined
                                    }
                                    className={`admin-nav-item group flex items-center px-3 py-2.5 lg:py-1.5 rounded-lg text-[13px] transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] ${
                                        item.active
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

            {portfolioSlug && (
                <div className="admin-sidebar-footer shrink-0 p-3 border-t">
                    <a
                        href={route("portfolio.index", { slug: portfolioSlug })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onNavigate}
                        title={`Open live portfolio (/${portfolioSlug})`}
                        className="admin-sidebar-live group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                    isPortfolioActive
                                        ? "admin-sidebar-live-icon-active"
                                        : "admin-sidebar-live-icon-draft"
                                }`}
                            >
                                <HiOutlineGlobeAlt className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-[var(--text)] leading-none">
                                        Live Site
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
                                            isPortfolioActive
                                                ? "admin-status-active"
                                                : "admin-status-draft"
                                        }`}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full shrink-0"
                                            style={{
                                                backgroundColor:
                                                    isPortfolioActive
                                                        ? "var(--success)"
                                                        : "var(--text-muted)",
                                            }}
                                        />
                                        {isPortfolioActive ? "Active" : "Draft"}
                                    </span>
                                </div>
                                <p className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-1 leading-none">
                                    /{portfolioSlug}
                                </p>
                            </div>
                        </div>

                        <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </a>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="admin-sidebar hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 z-30 border-r">
                {renderBody()}
            </aside>

            {/* Mobile Accessible Sidebar Drawer */}
            <Dialog
                open={Boolean(sidebarOpen)}
                onClose={onClose}
                data-theme={theme}
                aria-label="Admin navigation drawer"
                className="admin-theme relative z-50 lg:hidden font-sans"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150 data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                        as="aside"
                        transition
                        className="admin-sidebar-mobile relative z-10 w-64 max-w-[85vw] h-full border-r transition-transform duration-200 data-[closed]:-translate-x-full"
                    >
                        {renderBody(onClose)}
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}
