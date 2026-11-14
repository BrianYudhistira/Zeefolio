import { Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiArrowUpRight,
    HiOutlineGlobeAlt,
    HiArrowsPointingOut,
    HiOutlineCube,
} from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";
import { getDeviconClass } from "@/Utils/devicon";

export default function ProjectDetailHero({
    project,
    heroImage,
    techStack = [],
    onImageClick,
}) {
    return (
        <>
            {/* Breadcrumbs & Category Badge */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <AnimatedContent
                    distance={20}
                    direction="vertical"
                    reverse={true}
                    duration={0.8}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    scale={1}
                    threshold={0.1}
                >
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/projects" className="hover:text-white transition-colors">
                            Projects
                        </Link>
                        <span>/</span>
                        <span className="text-neutral-200 truncate max-w-[200px] sm:max-w-none">
                            {project.title}
                        </span>
                    </div>
                </AnimatedContent>
            </div>

            {/* Project Header Info */}
            <div className="mb-12">
                <AnimatedContent
                    distance={30}
                    direction="vertical"
                    reverse={true}
                    duration={1}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    scale={1}
                    threshold={0.1}
                    delay={0.05}
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {project.is_featured && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Featured Work
                            </span>
                        )}
                        <span className="px-3 py-1 text-[11px] font-mono tracking-widest uppercase text-neutral-300 bg-white/[0.04] border border-white/10 rounded-full">
                            {project.type || project.project_type || "Production System"}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                        {project.title}
                    </h1>

                    <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-4xl mb-8">
                        {project.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3.5">
                        {project.demo_url && (
                            <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-medium text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
                            >
                                <HiOutlineGlobeAlt className="w-4 h-4" />
                                <span>Live Preview</span>
                                <HiArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        )}

                        {project.source_url && (
                            <a
                                href={project.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/25 text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-300 backdrop-blur-md"
                            >
                                <FaGithub className="w-4 h-4" />
                                <span>Source Code</span>
                            </a>
                        )}
                    </div>
                </AnimatedContent>
            </div>

            {/* Hero Image Showcase */}
            {heroImage && (
                <AnimatedContent
                    distance={40}
                    direction="vertical"
                    reverse={false}
                    duration={1.2}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    scale={0.98}
                    threshold={0.1}
                    delay={0.15}
                >
                    <div className="relative mb-8">
                        {/* Ambient Glow */}
                        <div className="absolute inset-0 rounded-3xl bg-white/[0.03] blur-3xl scale-95 pointer-events-none" />

                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl p-3 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                            <div
                                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 cursor-pointer group"
                                onClick={() => onImageClick && onImageClick(heroImage)}
                            >
                                <img
                                    src={heroImage}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="p-3 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                                        <HiArrowsPointingOut className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedContent>
            )}

            {/* Minimalist Horizontal Technologies (Under Hero Image) */}
            {techStack.length > 0 && (
                <AnimatedContent
                    distance={25}
                    direction="vertical"
                    reverse={false}
                    duration={0.9}
                    ease="power3.out"
                    initialOpacity={0}
                    animateOpacity
                    scale={1}
                    threshold={0.1}
                >
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-3 px-4 sm:px-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl mb-16">
                        <span className="text-xs font-mono tracking-widest uppercase text-neutral-400 shrink-0 sm:border-r border-white/10 sm:pr-3.5">
                            Technologies:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {techStack.map((tech, idx) => {
                                const iconClass = getDeviconClass(tech.icon);
                                return (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all text-xs font-mono"
                                    >
                                        {iconClass ? (
                                            <i className={`${iconClass} text-sm`} />
                                        ) : (
                                            <HiOutlineCube className="w-3.5 h-3.5 text-neutral-400" />
                                        )}
                                        <span>{tech.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </AnimatedContent>
            )}
        </>
    );
}
