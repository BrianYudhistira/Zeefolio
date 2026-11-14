import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import ProjectDetailHero from "@/Components/Portfolio/Projects/ProjectDetailHero";
import ProjectShowcaseGallery from "@/Components/Portfolio/Projects/ProjectShowcaseGallery";
import ProjectLightboxModal from "@/Components/Portfolio/Projects/ProjectLightboxModal";
import PortfolioFooter from "@/Components/Portfolio/PortfolioFooter";
import { HiOutlineArrowLeft } from "react-icons/hi2";

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

export default function DetailProject({
    project,
    portfolioSlug = "brian-yudhistira",
    portfolioName = "Portfolio",
}) {
    const [lightboxImage, setLightboxImage] = useState(null);

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400 font-mono gap-4">
                <p>Project not found.</p>
                <Link
                    href={`/${portfolioSlug}/projects`}
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
                srcArray = image.image_path.map(
                    (p) => `/storage/${p.replace(/^\//, "")}`
                );
            } else if (image.image_path) {
                srcArray = [`/storage/${image.image_path.replace(/^\//, "")}`];
            }

            return {
                src: srcArray,
                alt: image.title || `${project.title} Screenshot ${idx + 1}`,
                caption:
                    image.description ||
                    project.description ||
                    "Application interface preview",
            };
        })
        : [];

    const heroImage =
        project.image_url ||
        (project.image_path
            ? `/storage/${(Array.isArray(project.image_path)
                ? project.image_path[0]
                : project.image_path
            ).replace(/^\//, "")}`
            : screenshots[0]?.src?.[0] || null);

    const techStack = resolveTechStack(project);

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
                        <Link
                            href={`/${portfolioSlug}`}
                            className="flex items-center gap-2.5 font-bold tracking-tight text-white group"
                        >
                            <img
                                src="/images/web_icon.png"
                                alt="Logo"
                                className="h-6 w-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <span className="text-xs sm:text-sm font-mono tracking-wider uppercase hidden sm:inline text-neutral-200 group-hover:text-white transition-colors">
                                {portfolioName}
                            </span>
                        </Link>

                        <div className="h-4 w-px bg-white/10" />

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/${portfolioSlug}/projects`}
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
                        <ProjectDetailHero
                            project={project}
                            heroImage={heroImage}
                            techStack={techStack}
                            onImageClick={(imgSrc) => setLightboxImage(imgSrc)}
                        />

                        <ProjectShowcaseGallery
                            screenshots={screenshots}
                            onImageClick={(imgSrc) => setLightboxImage(imgSrc)}
                        />
                    </div>
                </main>

                {/* ── Image Lightbox Modal ── */}
                <ProjectLightboxModal
                    image={lightboxImage}
                    onClose={() => setLightboxImage(null)}
                />

                {/* ── Minimalist Monochrome Footer ── */}
                <PortfolioFooter />
            </div>
        </>
    );
}
