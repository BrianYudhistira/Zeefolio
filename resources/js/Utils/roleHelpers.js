export const ROLE_CONFIG = {
    superadmin: {
        label: "Super Admin",
        badgeClass: "bg-amber-500/10 border-amber-500/25 text-amber-300",
        description:
            "Full access to manage all accounts, roles, site settings, and portfolios.",
    },
    admin: {
        label: "Admin",
        badgeClass: "bg-sky-500/10 border-sky-500/25 text-sky-300",
        description:
            "Manage default skills and categories, review portfolios, and manage member accounts.",
    },
    member: {
        label: "Member",
        badgeClass: "bg-zinc-800 border-zinc-700 text-zinc-300",
        description:
            "Manage their own portfolio, projects, skills, experiences, and contacts.",
    },
};

export function getRoleConfig(roleName, availableRoles = []) {
    const normalized = roleName || "member";
    if (ROLE_CONFIG[normalized]) {
        return ROLE_CONFIG[normalized];
    }

    const found = availableRoles.find((r) => r.name === normalized);
    const label = String(normalized).replace(/_/g, " ");

    return {
        label,
        badgeClass:
            "bg-purple-500/10 border-purple-500/25 text-purple-300 capitalize",
        description:
            found?.description ||
            `Custom role "${label}" with tailored access permissions.`,
    };
}
