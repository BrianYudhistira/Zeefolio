import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import ProjectArchiveCard from "@/Components/Portfolio/Projects/ProjectArchiveCard";
import PortfolioFooter from "@/Components/Portfolio/PortfolioFooter";
import SeoHead from "@/Components/Portfolio/SeoHead";
import {
    HiOutlineArrowLeft,
    HiMagnifyingGlass,
    HiXMark,
    HiOutlineFolderOpen,
} from "react-icons/hi2";

const BASE_CATEGORIES = [
    { id: "all", label: "All Projects" },
    { id: "website", label: "Websites" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "backend", label: "Backend & APIs" },
];

export default function ListProject({
    projects = [],
    portfolioSlug = "brian-yudhistira",
    portfolioName = "Portfolio",
    seo = null,
}) {
    const projectList = Array.isArray(projects) ? projects : [];
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedIds, setExpandedIds] = useState({});

    const categories = useMemo(() => {
        const known = new Set(BASE_CATEGORIES.map((c) => c.id.toLowerCase()));
        const dynamic = [];
        projectList.forEach((p) => {
            const raw = String(p.project_type || "").trim();
            if (!raw) return;
            const key = raw.toLowerCase();
            if (!known.has(key)) {
                known.add(key);
                dynamic.push({
                    id: raw,
                    label: raw.replace(/-/g, " "),
                });
            }
        });
        return [...BASE_CATEGORIES, ...dynamic];
    }, [projectList]);

    const toggleExpand = (id) => {
        setExpandedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const filteredProjects = useMemo(() => {
        return projectList.filter((project) => {
            const matchCategory =
                activeCategory === "all" ||
                project.project_type?.toLowerCase() === activeCategory.toLowerCase() ||
                project.type?.toLowerCase() === activeCategory.toLowerCase();

            if (!matchCategory) return false;

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

    return (
        <>
            <SeoHead
                seo={seo}
                fallbackTitle={`Projects - ${portfolioName}`}
            />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans flex flex-col justify-between">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-white/[0.04] via-white/[0.01] to-transparent blur-3xl" />
                </div>

                {/* ── Fixed Floating Header ── */}
                <header className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 sm:py-6 px-4 pointer-events-none">
                    <nav className="pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[90%] sm:max-w-fit">
                        <Link
                            href={`/${portfolioSlug}`}
                            className="flex items-center gap-2.5 font-bold tracking-tight text-white group"
                        >
                            <img
                                src="/images/web_icon.png"
                                alt="Logo"
                                className="h-10 w-10 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <span className="text-xs sm:text-sm font-mono tracking-wider uppercase hidden sm:inline text-neutral-200 group-hover:text-white transition-colors">
                                {portfolioName}
                            </span>
                        </Link>

                        <div className="h-4 w-px bg-white/10 hidden sm:block" />

                        <Link
                            href={`/${portfolioSlug}`}
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
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                                    All Projects & Works
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                                    An extensive collection of software systems, web applications, and digital solutions I have engineered across different technologies.
                                </p>
                            </AnimatedContent>
                        </div>

                        {/* Filter and Search Bar */}
                        <div className="mb-10 space-y-4">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-0.5 shrink-0">
                                    {categories.map((cat) => {
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
                                {filteredProjects.map((project, index) => (
                                    <ProjectArchiveCard
                                        key={project.id || index}
                                        project={project}
                                        portfolioSlug={portfolioSlug}
                                        index={index}
                                        isExpanded={Boolean(expandedIds[project.id])}
                                        onToggleExpand={toggleExpand}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* ── Minimalist Monochrome Footer ── */}
                <PortfolioFooter />
            </div>
        </>
    );
}
