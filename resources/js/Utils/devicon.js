/**
 * Normalize a short Devicon name or full class into a colored Devicon class string.
 *
 * @param {string|null|undefined} icon
 * @returns {string|null}
 */
export function getDeviconClass(icon) {
    if (!icon || typeof icon !== "string") return null;
    const trimmed = icon.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("devicon-")) return `${trimmed} colored`;
    return `devicon-${trimmed}-plain colored`;
}

