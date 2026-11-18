import { Link } from "@inertiajs/react";
import {
    HiOutlineFolderOpen,
    HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function RecentProjectsCard({
    recentProjects = [],
    portfolioSlug = "brian-yudhistira",
}) {
    return (
        <div className="lg:col-span-7 admin-card rounded-xl border overflow-hidden">
            <div className="admin-card-header px-4 py-3 sm:px-5 sm:py-4 border-b flex items-center justify-between">
                <h2 className="text-sm font-medium text-[var(--text)]">
                    Recent Projects
                </h2>
                <Link
                    href={route("admin.projects.index")}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--orange-text)] transition-colors"
                >
                    <span className="sm:hidden">All →</span>
                    <span className="hidden sm:inline">Manage all →</span>
                </Link>
            </div>

            {recentProjects.length === 0 ? (
                <div className="px-4 py-8 sm:px-5 sm:py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[color-mix(in_srgb,var(--orange)_12%,transparent)] border border-[color-mix(in_srgb,var(--orange)_26%,transparent)] flex items-center justify-center text-[var(--orange-text)] mb-2.5 sm:mb-3">
                        <HiOutlineFolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text)]">
                        No projects yet
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                        Create your first project to showcase it on your portfolio.
                    </p>
                    <Link
                        href={route("admin.projects.index")}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:border-[color-mix(in_srgb,var(--orange)_42%,var(--border-strong))] text-[var(--text)] border border-[var(--border-strong)] text-xs font-medium transition-colors"
                    >
                        Add Project
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-[var(--border)] max-h-80 sm:max-h-[26rem] overflow-y-auto">
                    {recentProjects.map((project) => (
                        <Link
                            key={project.id}
                            href={route("portfolio.project", {
                                slug: portfolioSlug,
                                projectSlug: project.slug,
                            })}
                            className="group flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-[color-mix(in_srgb,var(--surface-elevated)_65%,transparent)] transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-[var(--text)] truncate">
                                    {project.title}
                                </p>
                                {project.project_type && (
                                    <p className="text-[11px] sm:text-xs text-[var(--text-muted)] capitalize mt-0.5 truncate">
                                        {project.project_type}
                                    </p>
                                )}
                            </div>
                            <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--orange-text)] shrink-0 transition-colors" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
