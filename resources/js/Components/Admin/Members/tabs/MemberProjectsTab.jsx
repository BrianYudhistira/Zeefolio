import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

export default function MemberProjectsTab({ selectedMember }) {
    const projects = selectedMember.portfolio?.projects || [];

    return (
        <div className="space-y-3">
            {projects.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">
                    No projects added by this member yet.
                </p>
            ) : (
                projects.map((project) => (
                    <div
                        key={project.id}
                        className="p-3.5 sm:p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-start justify-between gap-3 sm:gap-4"
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-zinc-100 truncate max-w-full">
                                    {project.title}
                                </p>
                                {project.project_type && (
                                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 capitalize shrink-0">
                                        {project.project_type}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2">
                                {project.description}
                            </p>
                            {project.tech_stacks?.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {project.tech_stacks.map((t) => (
                                        <span
                                            key={t}
                                            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {project.slug && (
                            <a
                                href={route("portfolio.project", {
                                    slug:
                                        selectedMember.portfolio?.slug ||
                                        selectedMember.username,
                                    projectSlug: project.slug,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${project.title} public detail`}
                                title="Open project detail"
                                className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                            >
                                <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
