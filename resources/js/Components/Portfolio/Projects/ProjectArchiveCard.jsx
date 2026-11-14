import { Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { HiArrowUpRight } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";
import { getDeviconClass } from "@/Utils/devicon";
import { getProjectCover } from "@/Utils/projectHelpers";

export default function ProjectArchiveCard({
    project,
    portfolioSlug = "brian-yudhistira",
    index,
    isExpanded,
    onToggleExpand,
}) {
    const coverSrc = getProjectCover(project);
    const techStacks =
        project.tech_stacks && project.tech_stacks.length > 0
            ? project.tech_stacks
            : null;
    const techStackStrings =
        project.tech_stack && project.tech_stack.length > 0
            ? project.tech_stack
            : null;

    return (
        <AnimatedContent
            distance={30}
            direction="vertical"
            reverse={false}
            duration={0.8}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={1}
            threshold={0.05}
            delay={(index % 3) * 0.1}
            className="h-full"
        >
            <div className="group relative h-full flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/25 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                {/* Image Preview */}
                <Link
                    href={`/${portfolioSlug}/projects/${project.slug}`}
                    className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 border border-white/[0.08] mb-4 block"
                >
                    <img
                        src={coverSrc}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Project Type Badge */}
                    {(project.type || project.project_type) && (
                        <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase text-white bg-black/60 backdrop-blur-md border border-white/10 rounded-md">
                                {project.type || project.project_type}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Title & Description */}
                <div className="flex-1 flex flex-col space-y-2 mb-4">
                    <Link
                        href={`/${portfolioSlug}/projects/${project.slug}`}
                        className="text-lg font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors"
                    >
                        {project.title}
                    </Link>
                    <p
                        onClick={() => onToggleExpand(project.id)}
                        className={`text-xs sm:text-sm text-neutral-400 leading-relaxed cursor-pointer hover:text-neutral-300 transition-colors ${
                            isExpanded ? "" : "line-clamp-3"
                        }`}
                        title="Click to toggle full description"
                    >
                        {project.description}
                    </p>
                </div>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto pt-2">
                    {techStacks
                        ? (isExpanded ? techStacks : techStacks.slice(0, 4)).map(
                              (ts, i) => (
                                  <span
                                      key={i}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                  >
                                      {ts.icon && (
                                          <i
                                              className={`${getDeviconClass(
                                                  ts.icon
                                              )} text-[12px] text-neutral-400`}
                                          />
                                      )}
                                      {ts.name}
                                  </span>
                              )
                          )
                        : techStackStrings &&
                          (isExpanded
                              ? techStackStrings
                              : techStackStrings.slice(0, 4)
                          ).map((tech, i) => (
                              <span
                                  key={i}
                                  className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                              >
                                  {tech}
                              </span>
                          ))}
                    {!isExpanded &&
                        ((techStacks?.length || 0) > 4 ||
                            (techStackStrings?.length || 0) > 4) && (
                            <button
                                type="button"
                                onClick={() => onToggleExpand(project.id)}
                                className="px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors"
                            >
                                +
                                {Math.max(
                                    techStacks?.length || 0,
                                    techStackStrings?.length || 0
                                ) - 4}{" "}
                                more
                            </button>
                        )}
                </div>

                {/* Card Footer Links */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs font-mono">
                    {project.source_url ? (
                        <a
                            href={project.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                        >
                            <FaGithub className="w-3.5 h-3.5" />
                            <span>Repository</span>
                        </a>
                    ) : (
                        <span className="text-neutral-600">Confidential</span>
                    )}

                    <Link
                        href={`/${portfolioSlug}/projects/${project.slug}`}
                        className="inline-flex items-center gap-1 text-white hover:text-neutral-300 transition-colors font-medium group/link"
                    >
                        <span>View Details</span>
                        <HiArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                </div>
            </div>
        </AnimatedContent>
    );
}
