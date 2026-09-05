import { useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiArrowUpRight,
    HiOutlineArrowLeft,
    HiArrowUp,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineGlobeAlt,
    HiXMark,
    HiArrowsPointingOut,
    HiOutlineCube
} from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";

function getDeviconClass(icon) {
    if (!icon) return null;
    if (icon.startsWith("devicon-")) return `${icon} colored`;
    return `devicon-${icon}-plain colored`;
}

function resolveTechStack(project) {
    if (project.tech_stacks && project.tech_stacks.length > 0) {
        return project.tech_stacks.map((ts) => ({
            name: ts.name,
            icon: ts.icon,
        }));
    }
    if (project.techStacks && project.techStacks.length > 0) {
        return project.techStacks.map((ts) => ({
            name: ts.name,
            icon: ts.icon,
        }));
    }
    if (project.tech_stack && project.tech_stack.length > 0) {
        return project.tech_stack.map((name) => ({
            name,
            icon: name.toLowerCase().replace(/[\s.]+/g, ""),
        }));
    }
    return [];
}

function ImageSlider({ images, altText, onImageClick }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.3 }
        );

        if (sliderRef.current) {
            observer.observe(sliderRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!images || images.length <= 1 || !isInView || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [images, currentIndex, isInView, isHovered]);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div
                className="relative group/single cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => onImageClick && onImageClick(images[0])}
            >
                <img
                    src={images[0]}
                    alt={altText}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover/single:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/single:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                        <HiArrowsPointingOut className="w-4 h-4" />
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={sliderRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group/slider bg-neutral-950 border border-white/10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((imgSrc, idx) => (
                    <div
                        key={idx}
                        className="w-full h-full shrink-0 relative cursor-pointer"
                        onClick={() => onImageClick && onImageClick(imgSrc)}
                    >
                        <img
                            src={imgSrc}
                            alt={`${altText} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                                <HiArrowsPointingOut className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Controls */}
            <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all z-20 border border-white/10 shadow-lg backdrop-blur-md"
                aria-label="Previous image"
            >
                <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all z-20 border border-white/10 shadow-lg backdrop-blur-md"
                aria-label="Next image"
            >
                <HiChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots & Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function DetailProject({ project }) {
    const [lightboxImage, setLightboxImage] = useState(null);

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400 font-mono gap-4">
                <p>Project not found.</p>
                <Link
                    href="/projects"
                    className="px-4 py-2 rounded-xl bg-white/[0.05] text-white border border-white/15 text-xs font-mono uppercase tracking-wider"
                >
                    Back to Projects
                </Link>
            </div>
        );
    }

    const screenshots = project.images?.length
        ? project.images.map((image, idx) => {
            let srcArray = [];
            if (Array.isArray(image.image_url)) {
                srcArray = image.image_url;
            } else if (image.image_url) {
                srcArray = [image.image_url];
            } else if (Array.isArray(image.image_path)) {
                srcArray = image.image_path.map((p) => `/storage/${p.replace(/^\//, "")}`);
            } else if (image.image_path) {
                srcArray = [`/storage/${image.image_path.replace(/^\//, "")}`];
            }

            return {
                src: srcArray,
                alt: image.title || `${project.title} Screenshot ${idx + 1}`,
                caption: image.description || project.description || "Application interface preview",
            };
        })
        : [];

    const heroImage =
        project.image_url ||
        (project.image_path
            ? `/storage/${(Array.isArray(project.image_path) ? project.image_path[0] : project.image_path).replace(/^\//, "")}`
            : screenshots[0]?.src?.[0] || null);

    const techStack = resolveTechStack(project);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <Head title={`${project.title} - Project Details`} />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans flex flex-col justify-between">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-white/[0.04] via-white/[0.01] to-transparent blur-3xl" />
                </div>

                {/* ── Fixed Floating Header ── */}
                <header className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 sm:py-6 px-4 pointer-events-none">
                    <nav className="pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between gap-4 sm:gap-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[95%] sm:max-w-fit">
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

                        <div className="h-4 w-px bg-white/10" />

                        {/* Back Links */}
                        <div className="flex items-center gap-2">
                            <Link
                                href="/projects"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all duration-300"
                            >
                                <HiOutlineArrowLeft className="w-3.5 h-3.5" />
                                <span>Projects Archive</span>
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* ── Main Content ── */}
                <main
                    style={{ paddingTop: "clamp(140px, 16vh, 190px)" }}
                    className="relative z-10 pb-20 px-4 sm:px-6 lg:px-8 flex-1"
                >
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full">
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
                                            onClick={() => setLightboxImage(heroImage)}
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

                        {/* Screenshots Showcase Section */}
                        {screenshots.length > 0 && (
                            <section className="mb-20">
                                <div className="my-16">
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>

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
                                >
                                    <div className="mb-12">
                                        <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-2">
                                            02 // INTERFACE SHOWCASE
                                        </span>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                            Visual Walkthrough & Screenshots
                                        </h2>
                                        <p className="text-neutral-400 text-sm max-w-xl mt-2 font-mono">
                                            Interactive screen previews and functional views of this application.
                                        </p>
                                    </div>
                                </AnimatedContent>

                                <div className="space-y-16 lg:space-y-24">
                                    {screenshots.map((screenshot, idx) => (
                                        <AnimatedContent
                                            key={idx}
                                            distance={40}
                                            direction="vertical"
                                            reverse={false}
                                            duration={1}
                                            ease="power3.out"
                                            initialOpacity={0}
                                            animateOpacity
                                            scale={0.98}
                                            threshold={0.05}
                                            delay={0.05}
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                                                {/* Left Slider / Image */}
                                                <div className={`lg:col-span-8 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                                                    <ImageSlider
                                                        images={screenshot.src}
                                                        altText={screenshot.alt}
                                                        onImageClick={(imgSrc) => setLightboxImage(imgSrc)}
                                                    />
                                                </div>

                                                {/* Right Information */}
                                                <div className={`lg:col-span-4 space-y-4 ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}>
                                                    <span className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-500 block">
                                                        {String(idx + 1).padStart(2, "0")} / {String(screenshots.length).padStart(2, "0")}
                                                    </span>
                                                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                                        {screenshot.alt}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                                                        {screenshot.caption}
                                                    </p>
                                                </div>
                                            </div>
                                        </AnimatedContent>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>

                {/* ── Image Lightbox Modal ── */}
                {lightboxImage && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
                        onClick={() => setLightboxImage(null)}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors"
                            aria-label="Close image preview"
                        >
                            <HiXMark className="w-6 h-6" />
                        </button>
                        <img
                            src={lightboxImage}
                            alt="Full preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* ── Minimalist Monochrome Footer ── */}
                <footer className="w-full border-t border-white/[0.08] py-12 px-4 relative z-10 bg-black mt-auto">
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-white font-mono text-sm font-bold tracking-wider hover:text-neutral-300 transition-colors">
                                PORTFOLIO
                            </Link>
                            <span className="text-neutral-400 text-xs font-mono">
                                / {project.title}
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