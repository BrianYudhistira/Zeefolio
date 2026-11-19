export function groupPermissions(permissions = []) {
    return permissions.reduce((acc, perm) => {
        const grp = perm.group || "General";
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(perm);
        return acc;
    }, {});
}

export function togglePermissionList(current = [], permName) {
    return current.includes(permName)
        ? current.filter((p) => p !== permName)
        : [...current, permName];
}

export function hasUserPermission(user, permission) {
    if (!user) return false;
    if (user.role === "superadmin") return true;
    const perms = Array.isArray(user.permission_names)
        ? user.permission_names
        : [];
    return perms.includes(permission);
}

export function getBrandSuffix(appName = "ZeeFolio") {
    return appName.toLowerCase() === "zeefolio" ? "eeFolio" : appName;
}
