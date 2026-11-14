/**
 * Dispatch a toast notification to AdminLayout.
 *
 * @param {Object} options
 * @param {"success"|"error"|"info"} [options.type="success"]
 * @param {string} options.title
 * @param {string} options.message
 */
export function notifyAdmin({ type = "success", title, message }) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
        new CustomEvent("admin:notify", {
            detail: {
                type,
                title,
                message,
            },
        })
    );
}

