import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    HiOutlineArrowLeftOnRectangle,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineSquares2X2,
    HiOutlineFolderOpen,
    HiOutlineGlobeAlt,
    HiOutlineUserCircle,
    HiOutlineHome,
    HiOutlineCpuChip,
    HiOutlineBriefcase,
    HiOutlineCodeBracketSquare,
    HiOutlineEnvelope,
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineShieldCheck,
    HiOutlineChevronUpDown,
    HiXMark,
} from "react-icons/hi2";

function getRoleMeta(role) {
    switch (role) {
        case "superadmin":
            return {
                label: "Super Admin",
                badgeClass: "bg-amber-500/10 border-amber-500/25 text-amber-300",
            };
        case "admin":
            return {
                label: "Admin",
                badgeClass: "bg-sky-500/10 border-sky-500/25 text-sky-300",
            };
        case "member":
        case "user":
        case undefined:
        case null:
            return {
                label: "Member",
                badgeClass: "bg-zinc-800 border-zinc-700 text-zinc-400",
            };
        default:
            return {
                label: String(role).replace(/_/g, " "),
                badgeClass:
                    "bg-purple-500/10 border-purple-500/25 text-purple-300 capitalize",
            };
    }
}

export default function Sidebar({
    appName = "Zeefolio",
    user = null,
    sidebarOpen = false,
    onClose,
    onLogout,
}) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("[data-user-menu]")) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navGroups = [
        {
            items: [
                {
                    name: "Dashboard",
                    href: route("admin.dashboard"),
                    active: route().current("admin.dashboard"),
                    icon: HiOutlineSquares2X2,
                },
            ],
        },
        {
            label: "Content Management",
            items: [
                {
                    name: "Home & Profile",
                    href: route("admin.home.index"),
                    active: route().current("admin.home.*"),
                    icon: HiOutlineHome,
                },
                {
                    name: "Projects",
                    href: route("admin.projects.index"),
                    active: route().current("admin.projects.*"),
                    icon: HiOutlineFolderOpen,
                },
                {
                    name: "Skills",
                    href: route("admin.skills.index"),
                    active: route().current("admin.skills.*"),
                    icon: HiOutlineCpuChip,
                },
                {
                    name: "Experiences",
                    href: route("admin.experiences.index"),
                    active: route().current("admin.experiences.*"),
                    icon: HiOutlineBriefcase,
                },
                {
                    name: "Tech Stacks",
                    href: route("admin.tech-stacks.index"),
                    active: route().current("admin.tech-stacks.*"),
                    icon: HiOutlineCodeBracketSquare,
                },
                {
                    name: "Contacts",
                    href: route("admin.contacts.index"),
                    active: route().current("admin.contacts.*"),
                    icon: HiOutlineEnvelope,
                },
            ],
        },
        ...(() => {
            const isAdminOrSuper = ["superadmin", "admin"].includes(user?.role);
            const perms = Array.isArray(user?.permission_names)
                ? user.permission_names
                : [];
            const canViewMembers =
                isAdminOrSuper || perms.includes("members.view");
            const canManageRoles =
                user?.role === "superadmin" ||
                perms.includes("roles.manage") ||
                perms.includes("permissions.manage");
            const canManageSettings =
                isAdminOrSuper || perms.includes("settings.manage");

            const adminItems = [
                ...(canViewMembers
                    ? [
                          {
                              name: "Members & Accounts",
                              href: route("admin.members.index"),
                              active: route().current("admin.members.*"),
                              icon: HiOutlineUsers,
                          },
                      ]
                    : []),
                ...(canManageRoles
                    ? [
                          {
                              name: "Roles & Permissions",
                              href: route("admin.roles.index"),
                              active:
                                  route().current("admin.roles.*") ||
                                  route().current("admin.permissions.*"),
                              icon: HiOutlineShieldCheck,
                          },
                      ]
                    : []),
                ...(canManageSettings
                    ? [
                          {
                              name: "Settings",
                              href: route("admin.settings.index"),
                              active: route().current("admin.settings.*"),
                              icon: HiOutlineCog6Tooth,
                          },
                      ]
                    : []),
            ];

            return adminItems.length > 0
                ? [
                      {
                          label: "Administration",
                          items: adminItems,
                      },
                  ]
                : [];
        })(),
        {
            label: "Public View",
            items: [
                {
                    name: "Live Portfolio",
                    href: route("portfolio.index", {
                        slug:
                            user?.portfolio_slug ||
                            user?.username ||
                            "brian-yudhistira",
                    }),
                    active: false,
                    icon: HiOutlineGlobeAlt,
                    external: true,
                },
                {
                    name: "Projects Archive",
                    href: route("portfolio.projects", {
                        slug:
                            user?.portfolio_slug ||
                            user?.username ||
                            "brian-yudhistira",
                    }),
                    active: false,
                    icon: HiOutlineFolderOpen,
                    external: true,
                },
            ],
        },
    ];

    const roleMeta = getRoleMeta(user?.role);

    const renderBody = (onNavigate) => (
        <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <Link
                    href={route("admin.dashboard")}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 font-semibold text-zinc-100"
                >
                    <img
                        src="/images/web_icon.png"
                        alt="Logo"
                        className="h-6 w-6 object-contain grayscale"
                    />
                    <span className="text-sm tracking-tight">{appName}</span>
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    aria-label="Close Sidebar"
                >
                    <HiXMark className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-0.5">
                        <p className="px-3 pb-1 text-[11px] font-medium text-zinc-500">
                            {group.label}
                        </p>
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors ${item.active
                                            ? "bg-zinc-800/85 text-zinc-100 font-medium border border-zinc-700/70"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                                        }`}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Icon
                                            className={`w-4 h-4 ${item.active
                                                    ? "text-zinc-100"
                                                    : "text-zinc-500 group-hover:text-zinc-300"
                                                } transition-colors`}
                                        />
                                        <span>{item.name}</span>
                                    </span>
                                    {item.external && (
                                        <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User Popup Menu Footer */}
            <div
                data-user-menu
                className="relative p-3 border-t border-zinc-800/80 shrink-0"
            >
                {userMenuOpen && user && (
                    <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden py-1 z-40">
                        <Link
                            href={route("admin.account.index")}
                            onClick={() => {
                                setUserMenuOpen(false);
                                onNavigate?.();
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${route().current("admin.account.*")
                                    ? "bg-zinc-800 text-zinc-100 font-medium"
                                    : "text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100"
                                }`}
                        >
                            <HiOutlineUserCircle className="w-4 h-4 text-zinc-400" />
                            <span>Account Settings</span>
                        </Link>
                        <div className="my-1 border-t border-zinc-800/80" />
                        <button
                            type="button"
                            onClick={() => {
                                setUserMenuOpen(false);
                                onLogout?.();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer text-left"
                        >
                            <HiOutlineArrowLeftOnRectangle className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}

                {user && (
                    <button
                        type="button"
                        onClick={() => setUserMenuOpen((prev) => !prev)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${userMenuOpen
                                ? "bg-zinc-800/80 border border-zinc-700/70"
                                : "hover:bg-zinc-800/50 border border-transparent"
                            }`}
                    >
                        {user.photo_url ? (
                            <img
                                src={user.photo_url}
                                alt={user.name}
                                className="w-8 h-8 rounded-lg object-cover border border-zinc-700 shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center shrink-0">
                                <HiOutlineUserCircle className="w-4 h-4 text-zinc-400" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs font-medium text-zinc-200 truncate">
                                    {user.name}
                                </p>
                                <span
                                    title={roleMeta.label}
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 ${roleMeta.badgeClass}`}
                                >
                                    <HiOutlineShieldCheck className="w-2.5 h-2.5" />
                                    <span>{roleMeta.label}</span>
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                {user.email}
                            </p>
                        </div>
                        <HiOutlineChevronUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-30 bg-zinc-900/45 border-r border-zinc-800/80">
                {renderBody()}
            </aside>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <aside className="relative z-10 w-64 max-w-[85vw] h-full bg-zinc-900 border-r border-zinc-800">
                        {renderBody(onClose)}
                    </aside>
                </div>
            )}
        </>
    );
}

