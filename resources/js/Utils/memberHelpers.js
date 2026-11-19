export { ROLE_CONFIG, getRoleConfig } from "./roleHelpers";

export const PROFICIENCY_LABELS = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

export const STATUS_CONFIG = {
    active: {
        label: "Active",
        dotClass: "admin-status-dot-active",
        badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    },
    dnd: {
        label: "Do Not Disturb",
        dotClass: "admin-status-dot-dnd",
        badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    },
    banned: {
        label: "Suspended",
        dotClass: "admin-status-dot-banned",
        badgeClass: "bg-red-500/10 border-red-500/20 text-red-300",
    },
};
