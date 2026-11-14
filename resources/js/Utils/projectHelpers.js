/**
 * Normalize project showcase items from backend into editable form items.
 *
 * @param {Array} images
 * @returns {Array}
 */
export function mapProjectShowcases(images = []) {
    if (!Array.isArray(images)) return [];
    return images.map((item) => {
        const rawPaths = Array.isArray(item.image_path)
            ? item.image_path
            : item.image_path
              ? [item.image_path]
              : [];

        const rawUrls = Array.isArray(item.image_url)
            ? item.image_url
            : item.image_url
              ? [item.image_url]
              : rawPaths.map((p) => `/storage/${String(p).replace(/^\//, "")}`);

        return {
            id: item.id || null,
            title: item.title || "",
            description: item.description || "",
            existing_images: rawPaths,
            existing_previews: rawUrls,
            new_images: [],
            new_previews: [],
        };
    });
}

/**
 * Resolve the cover image URL for a project in public views.
 *
 * @param {Object} project
 * @returns {string}
 */
export function getProjectCover(project) {
    if (!project) return "/images/placeholder.png";
    if (project.image_url) return project.image_url;
    if (project.images && project.images.length > 0) {
        const firstImg = project.images[0];
        if (firstImg.image_url) {
            return Array.isArray(firstImg.image_url)
                ? firstImg.image_url[0]
                : firstImg.image_url;
        }
        if (firstImg.image_path) {
            const p = Array.isArray(firstImg.image_path)
                ? firstImg.image_path[0]
                : firstImg.image_path;
            return `/storage/${String(p).replace(/^\//, "")}`;
        }
    }
    if (project.image_path) {
        const p = Array.isArray(project.image_path)
            ? project.image_path[0]
            : project.image_path;
        return `/storage/${String(p).replace(/^\//, "")}`;
    }
    return "/images/placeholder.png";
}

