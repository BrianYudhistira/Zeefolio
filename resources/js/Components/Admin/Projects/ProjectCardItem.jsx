import { usePage } from "@inertiajs/react";
import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineStar,
    HiOutlinePhoto,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineRectangleGroup,
} from "react-icons/hi2";

export default function ProjectCardItem({
    project,
    getCategoryLabel,
    onEdit,
    onDelete,
}) {
    const { auth } = usePage().props;
    const portfolioSlug =
        auth?.user?.portfolio_slug ||
        auth?.user?.username ||
        "brian-yudhistira";
    const showcaseCount = project.images?.length || 0;

    return (
        <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                    {project.image_url ? (
                        <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <HiOutlinePhoto className="w-5 h-5 text-zinc-600" />
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                            {project.title}
                        </h3>
                        {project.is_featured && (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-300">
                                <HiOutlineStar className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                    Featured
                                </span>
                            </span>
                        )}
                        {project.project_type && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-medium text-zinc-300 capitalize">
                                {getCategoryLabel
                                    ? getCategoryLabel(project.project_type)
                                    : project.project_type}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => onEdit(project, "showcase")}
                            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Manage Interface Showcases"
                        >
                            <HiOutlineRectangleGroup className="w-3 h-3" />
                            <span>{showcaseCount}</span>
                            <span className="hidden sm:inline">
                                {showcaseCount === 1 ? "showcase" : "showcases"}
                            </span>
                        </button>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1">
                        {project.description}
                    </p>

                    {project.tech_stacks?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {project.tech_stacks.map((ts, idx) => (
                                <span
                                    key={ts.id}
                                    className={`px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 ${
                                        idx >= 4 ? "hidden sm:inline-block" : ""
                                    }`}
                                >
                                    {ts.name}
                                </span>
                            ))}
                            {project.tech_stacks.length > 4 && (
                                <span className="sm:hidden px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500">
                                    +{project.tech_stacks.length - 4}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-1 sm:gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                <button
                    type="button"
                    onClick={() => onEdit(project, "showcase")}
                    className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] sm:text-xs text-zinc-300 hover:text-zinc-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit Interface Showcase"
                >
                    <HiOutlineRectangleGroup className="w-3.5 h-3.5" />
                    <span>Showcase</span>
                </button>
                {project.slug && (
                    <a
                        href={route("portfolio.project", {
                            slug: portfolioSlug,
                            projectSlug: project.slug,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="View public page"
                    >
                        <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                    </a>
                )}
                <button
                    type="button"
                    onClick={() => onEdit(project, "general")}
                    className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Edit project"
                >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(project)}
                    className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete project"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
