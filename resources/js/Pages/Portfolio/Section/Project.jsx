import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { HiArrowUpRight, HiOutlineArrowRight } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";

function getDeviconClass(icon) {
    if (!icon) return null;
    if (icon.startsWith('devicon-')) return `${icon} colored`;
    return `devicon-${icon}-plain colored`;
}

function getProjectCover(project) {
    if (project.image_url) return project.image_url;
    if (project.images && project.images.length > 0) {
        const firstImg = project.images[0];
        if (firstImg.image_url) {
            return Array.isArray(firstImg.image_url) ? firstImg.image_url[0] : firstImg.image_url;
        }
        if (firstImg.image_path) {
            const p = Array.isArray(firstImg.image_path) ? firstImg.image_path[0] : firstImg.image_path;
            return `/storage/${p.replace(/^\//, '')}`;
        }
    }
    if (project.image_path) {
        const p = Array.isArray(project.image_path) ? project.image_path[0] : project.image_path;
        return `/storage/${p.replace(/^\//, '')}`;
    }
    return "/images/placeholder.png";
}

export default function ProjectSection({ projects }) {
    const projectList = Array.isArray(projects) ? projects : [];

    return (
        <section id="project" className="relative w-full py-24 sm:py-32 scroll-mt-16">
            <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="mb-16 md:mb-20 text-center">
                    <AnimatedContent
                        distance={40}
                        direction="vertical"
                        reverse={true}
                        duration={1}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.15}
                        delay={0}
                    >
                        <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-3">
                            03 // PORTFOLIO
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                            Featured Projects
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                            A curated selection of systems, web applications, and digital solutions I have engineered.
                        </p>
                    </AnimatedContent>
                </div>

                {projectList.length === 0 ? (
                    <div className="text-center text-neutral-500 font-mono text-sm py-12">
                        No projects currently available.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                        {projectList.slice(0, 6).map((project, index) => (
                            <AnimatedContent
                                key={project.id || index}
                                distance={40}
                                direction="vertical"
                                reverse={false}
                                duration={1}
                                ease="power3.out"
                                initialOpacity={0}
                                animateOpacity
                                scale={1}
                                threshold={0.1}
                                delay={(index % 3) * 0.15}
                                className="h-full"
                            >
                                <div className="group relative h-full flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/25 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                                    {/* Image Preview */}
                                    <a
                                        href={`/projects/${project.slug}`}
                                        className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 border border-white/[0.08] mb-4 block cursor-pointer"
                                    >
                                        <img
                                            src={getProjectCover(project)}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                    </a>

                                    {/* Title & Description */}
                                    <div className="flex-1 flex flex-col space-y-2 mb-4">
                                        <a
                                            href={`/projects/${project.slug}`}
                                            className="text-lg font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors cursor-pointer"
                                        >
                                            {project.title}
                                        </a>
                                        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Tech Stack Chips */}
                                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto pt-2">
                                        {(project.tech_stacks && project.tech_stacks.length > 0
                                            ? project.tech_stacks.map((ts, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                                >
                                                    {ts.icon && <i className={`${getDeviconClass(ts.icon)} text-[12px] text-neutral-400`} />}
                                                    {ts.name}
                                                </span>
                                            ))
                                            : project.tech_stack?.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                                >
                                                    {tech}
                                                </span>
                                            ))
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

                                        <a
                                            href={`/projects/${project.slug}`}
                                            className="inline-flex items-center gap-1 text-white hover:text-neutral-300 transition-colors font-medium group/link"
                                        >
                                            <span>Details</span>
                                            <HiArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                        </a>
                                    </div>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {projectList.length > 6 && (
                    <div className="mt-12 flex justify-center">
                        <a
                            href="/projects"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/25 text-sm font-mono tracking-wider transition-all duration-300 backdrop-blur-md group"
                        >
                            <span>View All Projects ({projectList.length})</span>
                            <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}