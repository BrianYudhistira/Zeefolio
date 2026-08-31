import { Head, Link } from "@inertiajs/react";
import FuturisticBackground from "@/Components/Animations/Background/FuturisticBackground";
import { useState } from "react";

function getDeviconClass(icon) {
    if (!icon) return null;
    if (icon.startsWith('devicon-')) return icon;
    return `devicon-${icon}-plain`;
}

const CATEGORIES = [
    { id: "all", label: "All Projects" },
    { id: "website", label: "Website" },
    { id: "mobile", label: "Mobile Applications" },
    { id: "backend", label: "Backend Services" },
];

export default function ListProject({ projects })
{
    const [expandedProjects, setExpandedProjects] = useState({});
    const [activeCategory, setActiveCategory] = useState("all");

    const toggleExpand = (e, projectId) => {
        e.preventDefault();
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    const filteredProjects = projects.filter((project) => {
        if (activeCategory === "all") return true;
        return project.project_type?.toLowerCase() === activeCategory.toLowerCase();
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#050510] font-retro-mono">
            <Head title="List Project" />

            <FuturisticBackground
                speed={1}
                particleCount={80}
                interactive={true}
                resolutionScale={0.75}
            />

            <div className="relative z-10 flex flex-1 flex-col text-white lg:flex-row w-[90%] lg:w-[85%] 2xl:w-[90%] mx-auto py-8 lg:py-16">
                <aside className="w-full lg:w-auto shrink-0 pb-6 mb-6 lg:pb-0 lg:mb-0 lg:pr-8 lg:h-[calc(100vh-120px)] lg:sticky lg:top-16 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="flex flex-col gap-6 lg:gap-10 h-full">
                        <div className="flex flex-row items-center justify-between lg:gap-6">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <img src="/images/web_icon.png" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:scale-105" />
                                <span className="text-white font-extrabold text-base md:text-lg tracking-wider">
                                    ZeeeHub
                                </span>
                            </Link>
                            
                            <Link 
                                href="/"
                                className="group flex items-center gap-2 text-xs md:text-sm tracking-widest uppercase text-white/70 hover:text-cyan-400 transition-colors duration-300 font-medium w-fit"
                            >
                                <span className="text-cyan-400 group-hover:-translate-x-1 transition-transform">{'<'}</span> 
                            </Link>
                        </div>

                        {/* Project Categories Menu */}
                        <nav className="flex flex-row overflow-x-auto whitespace-nowrap lg:flex-col gap-6 text-xs md:text-sm tracking-widest uppercase pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {CATEGORIES.map((cat) => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`group flex items-center gap-2 lg:gap-3 transition-colors text-left ${
                                            isActive ? "text-cyan-400 font-bold" : "text-white/50 hover:text-cyan-400"
                                        }`}
                                    >
                                        <span className={`transition-opacity ${isActive ? "animate-pulse" : "opacity-0 group-hover:opacity-100"} hidden lg:inline`}>
                                            {'>'}
                                        </span>
                                        <span className={`pb-1 border-b transition-colors ${
                                            isActive ? "border-cyan-400/50" : "border-transparent group-hover:border-cyan-400/30"
                                        }`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 lg:pl-10">
                    {filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                            <p className="text-cyan-400 text-lg font-bold tracking-widest mb-2">[ 404_PROJECTS_NOT_FOUND ]</p>
                            <p className="text-white/50 text-sm">Tidak ada proyek ditemukan dalam kategori ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
                            {filteredProjects.map((project) => {
                                const isExpanded = expandedProjects[project.id];
                                const techStacks = project.tech_stacks && project.tech_stacks.length > 0 ? project.tech_stacks : null;
                                const techStackStrings = project.tech_stack && project.tech_stack.length > 0 ? project.tech_stack : null;
                                
                                const hasExtraTech = (techStacks && techStacks.length > 3) || (techStackStrings && techStackStrings.length > 3);
                                const extraTechCount = Math.max((techStacks?.length || 0), (techStackStrings?.length || 0)) - 3;

                                return (
                                    <Link href={`/me/projects/${project.slug}`} key={project.id} className="block h-full">
                                        <div className="group h-full relative bg-[#050510] border border-white/10  transition-all duration-300 p-4 flex flex-col rounded-xl">
                                            <div className="relative w-full h-48 mb-5 overflow-hidden border border-white/5 group-hover:border-cyan-400/30 transition-colors">
                                                <img 
                                                    src={project.images?.[0]?.image_url || '/images/placeholder.png'} 
                                                    alt={project.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300"></div>
                                            </div>
                                            
                                            <h3 className="text-white group-hover:text-cyan-400 transition-colors font-bold text-lg mb-2 uppercase tracking-wide">
                                                {project.title}
                                            </h3>
                                            
                                            <p 
                                                className={`text-white/50 text-sm flex-1 mb-4 transition-colors relative cursor-pointer hover:text-white/80 ${isExpanded ? '' : 'line-clamp-3'}`}
                                                onClick={(e) => toggleExpand(e, project.id)}
                                                title="Click to expand/collapse"
                                            >
                                                {project.description}
                                            </p>

                                            {/* Tech Stack */}
                                            <div 
                                                className="flex flex-wrap gap-2 mt-auto cursor-pointer"
                                                onClick={(e) => toggleExpand(e, project.id)}
                                                title="Click to expand/collapse tech stacks"
                                            >
                                                {techStacks && (isExpanded ? techStacks : techStacks.slice(0, 3)).map((ts, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-[#0a1b2e] border border-cyan-400/30 text-cyan-300 font-retro-mono flex items-center gap-1.5 hover:border-cyan-400 transition-colors"
                                                    >
                                                        {ts.icon && <i className={`${getDeviconClass(ts.icon)} text-[12px]`} />}
                                                        {ts.name}
                                                    </span>
                                                ))}

                                                {!techStacks && techStackStrings && (isExpanded ? techStackStrings : techStackStrings.slice(0, 3)).map((tech, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-[#0a1b2e] border border-cyan-400/30 text-cyan-300 font-retro-mono hover:border-cyan-400 transition-colors"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}

                                                {!isExpanded && hasExtraTech && (
                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-white/5 border border-white/10 text-white/50 font-retro-mono hover:bg-white/10 transition-colors">
                                                        +{extraTechCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}