import { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiArrowUpRight,
    HiOutlineArrowLeft,
    HiArrowUp,
    HiMagnifyingGlass,
    HiXMark,
    HiOutlineFolderOpen
} from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";

function getDeviconClass(icon) {
    if (!icon) return null;
    if (icon.startsWith("devicon-")) return `${icon} colored`;
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

const CATEGORIES = [
    { id: "all", label: "All Projects" },
    { id: "website", label: "Websites" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "backend", label: "Backend & APIs" },
];

export default function ListProject({ projects = [] }) {
    const projectList = Array.isArray(projects) ? projects : [];
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedIds, setExpandedIds] = useState({});

    const toggleExpand = (id) => {
        setExpandedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const filteredProjects = useMemo(() => {
        return projectList.filter((project) => {
            // Category filter
            const matchCategory =
                activeCategory === "all" ||
                project.project_type?.toLowerCase() === activeCategory.toLowerCase() ||
                project.type?.toLowerCase() === activeCategory.toLowerCase();

            if (!matchCategory) return false;

            // Search query filter
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            const titleMatch = project.title?.toLowerCase().includes(query);
            const descMatch = project.description?.toLowerCase().includes(query);

            const techMatch =
                project.tech_stacks?.some((ts) => ts.name?.toLowerCase().includes(query)) ||
                (Array.isArray(project.tech_stack) &&
                    project.tech_stack.some((ts) => ts.toLowerCase().includes(query)));

            return titleMatch || descMatch || techMatch;
        });
    }, [projectList, activeCategory, searchQuery]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <Head title="Projects Archive - Portfolio" />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans flex flex-col justify-between">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-white/[0.04] via-white/[0.01] to-transparent blur-3xl" />
                </div>

                {/* ── Fixed Floating Header ── */}
                <header className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 sm:py-6 px-4 pointer-events-none">
                    <nav className="pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[90%] sm:max-w-fit">
                        {/* Brand Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 font-bold tracking-tight text-white group"
                        >
                            <img
                                src="/images/web_icon.png"
                                alt="Logo"
                                className="h-6 w-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <span className="text-xs sm:text-sm font-mono tracking-wider uppercase hidden sm:inline text-neutral-200 group-hover:text-white transition-colors">
                                Portfolio
                            </span>
                        </Link>

                        <div className="h-4 w-px bg-white/10 hidden sm:block" />

                        {/* Back to Home Button */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all duration-300"
                        >
                            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
                            <span>Return Home</span>
                        </Link>
                    </nav>
                </header>

                {/* ── Main Content ── */}
                <main
                    style={{ paddingTop: "clamp(140px, 16vh, 190px)" }}
                    className="relative z-10 pb-20 px-4 sm:px-6 lg:px-8 flex-1"
                >
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full">
                        {/* Page Header */}
                        <div className="mb-12 md:mb-16 text-center">
                            <AnimatedContent
                                distance={40}
                                direction="vertical"
                                reverse={true}
                                duration={1}
                                ease="power3.out"
                                initialOpacity={0}
                                animateOpacity
                                scale={1}
                                threshold={0.1}
                            >
                                {/* <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-3">
                                    04 // ARCHIVE
                                </span> */}
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                                    All Projects & Works
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                                    An extensive collection of software systems, web applications, and digital solutions I have engineered across different technologies.
                                </p>
                            </AnimatedContent>
                        </div>

                        {/* Filter and Search Bar - 1 Line (Categories Left, Search Right Compact) */}
                        <div className="mb-10 space-y-4">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                                {/* Category Tabs (Left) */}
                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-0.5 shrink-0">
                                    {CATEGORIES.map((cat) => {
                                        const isActive = activeCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${isActive
                                                        ? "text-black bg-white font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                                        : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Input (Right - Compact Width) */}
                                <div className="relative w-full sm:w-56 md:w-60 lg:w-64 shrink-0 px-1 md:px-0">
                                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search title or tech..."
                                        className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-neutral-500 text-xs font-mono tracking-wide focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
                                            aria-label="Clear search"
                                        >
                                            <HiXMark className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Results Count Header */}
                            <div className="flex items-center justify-between px-2 text-xs font-mono text-neutral-500">
                                <span>
                                    Showing <span className="text-white font-semibold">{filteredProjects.length}</span> of {projectList.length} projects
                                </span>
                                {(activeCategory !== "all" || searchQuery) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveCategory("all");
                                            setSearchQuery("");
                                        }}
                                        className="text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Projects Grid */}
                        {filteredProjects.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-16 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 text-neutral-400">
                                    <HiOutlineFolderOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider mb-2">
                                    No Projects Found
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6 font-mono">
                                    No projects matched the current search query or category filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory("all");
                                        setSearchQuery("");
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/15 text-xs font-mono uppercase tracking-wider transition-all"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                                {filteredProjects.map((project, index) => {
                                    const isExpanded = expandedIds[project.id];
                                    const coverSrc = getProjectCover(project);
                                    const techStacks = project.tech_stacks && project.tech_stacks.length > 0 ? project.tech_stacks : null;
                                    const techStackStrings = project.tech_stack && project.tech_stack.length > 0 ? project.tech_stack : null;

                                    return (
                                        <AnimatedContent
                                            key={project.id || index}
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
                                                    href={`/projects/${project.slug}`}
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
                                                        href={`/projects/${project.slug}`}
                                                        className="text-lg font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors"
                                                    >
                                                        {project.title}
                                                    </Link>
                                                    <p
                                                        onClick={() => toggleExpand(project.id)}
                                                        className={`text-xs sm:text-sm text-neutral-400 leading-relaxed cursor-pointer hover:text-neutral-300 transition-colors ${isExpanded ? "" : "line-clamp-3"
                                                            }`}
                                                        title="Click to toggle full description"
                                                    >
                                                        {project.description}
                                                    </p>
                                                </div>

                                                {/* Tech Stack Chips */}
                                                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto pt-2">
                                                    {techStacks
                                                        ? (isExpanded ? techStacks : techStacks.slice(0, 4)).map((ts, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                                            >
                                                                {ts.icon && (
                                                                    <i className={`${getDeviconClass(ts.icon)} text-[12px] text-neutral-400`} />
                                                                )}
                                                                {ts.name}
                                                            </span>
                                                        ))
                                                        : techStackStrings &&
                                                        (isExpanded ? techStackStrings : techStackStrings.slice(0, 4)).map((tech, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    {!isExpanded &&
                                                        ((techStacks?.length || 0) > 4 || (techStackStrings?.length || 0) > 4) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpand(project.id)}
                                                                className="px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors"
                                                            >
                                                                +{Math.max(techStacks?.length || 0, techStackStrings?.length || 0) - 4} more
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
                                                        href={`/projects/${project.slug}`}
                                                        className="inline-flex items-center gap-1 text-white hover:text-neutral-300 transition-colors font-medium group/link"
                                                    >
                                                        <span>View Details</span>
                                                        <HiArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </AnimatedContent>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* ── Minimalist Monochrome Footer ── */}
                <footer className="w-full border-t border-white/[0.08] py-12 px-4 relative z-10 bg-black mt-auto">
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-white font-mono text-sm font-bold tracking-wider hover:text-neutral-300 transition-colors">
                                PORTFOLIO
                            </Link>
                            <span className="text-neutral-400 text-xs font-mono">
                                / Projects Archive
                            </span>
                        </div>

                        <p className="text-xs font-mono text-neutral-400 text-center">
                            Designed with Minimalist Monochrome & Glassmorphism &copy; {new Date().getFullYear()}
                        </p>

                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                            aria-label="Back to Top"
                        >
                            <span>Top</span>
                            <HiArrowUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
}