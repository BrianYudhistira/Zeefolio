import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import HomeSection from "./Section/Home";
import SkillsSection from "./Section/Skills";
import ExperienceSection from "./Section/Experience";
import ProjectsSection from "./Section/Project";
import ContactSection from "./Section/Contact";
import { HiBars3, HiXMark, HiArrowUp } from "react-icons/hi2";

const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#skills", label: "Skills" },
    { href: "#experience", label: "Experience" },
    { href: "#project", label: "Projects" },
    { href: "#contact", label: "Contact" },
];

export default function Portfolio({ portfolio }) {
    const env = {
        name: import.meta.env.VITE_APP_NAME,
    };
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll state & active section tracking
    useEffect(() => {
        const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // If user reaches near the bottom of page, highlight the last section (Contact)
            const isBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 60;

            if (isBottom) {
                setActiveSection(sectionIds[sectionIds.length - 1]);
                return;
            }

            // Reading line offset under sticky/fixed header
            const readingOffset = 200;
            let currentSection = sectionIds[0];

            for (const id of sectionIds) {
                const element = document.getElementById(id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= readingOffset) {
                        currentSection = id;
                    }
                }
            }

            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!portfolio) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-mono">
                Loading portfolio data...
            </div>
        );
    }

    return (
        <>
            <Head title={`${portfolio.home?.name || "Developer"} - Portfolio`} />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans">
                {/* ── Navigation Bar ── */}
                <header className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 sm:py-6 px-4 pointer-events-none">
                    <nav
                        className={`pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 sm:py-3 ${
                            isScrolled
                                ? "bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                                : "bg-black/30 backdrop-blur-md border border-white/[0.06]"
                        } max-w-[90%] sm:max-w-fit`}
                    >
                        {/* Brand Logo */}
                        <a
                            href="#home"
                            className="flex items-center gap-2.5 font-bold tracking-tight text-white group"
                        >
                            <img
                                src="/images/web_icon.png"
                                alt="Logo"
                                className="h-6 w-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                            <span className="text-xs sm:text-sm font-mono tracking-wider uppercase hidden sm:inline">
                                {env.name}
                            </span>
                        </a>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1 sm:gap-2">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.href.replace("#", "");
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setActiveSection(link.href.replace("#", ""))}
                                        className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                                            isActive
                                                ? "text-white bg-white/[0.08] border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                                                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-neutral-300 hover:text-white p-1"
                            aria-label="Toggle Navigation"
                        >
                            {mobileMenuOpen ? (
                                <HiXMark className="w-6 h-6" />
                            ) : (
                                <HiBars3 className="w-6 h-6" />
                            )}
                        </button>
                    </nav>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                        <div className="pointer-events-auto absolute top-20 left-4 right-4 max-w-sm mx-auto rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl md:hidden">
                            <div className="flex flex-col space-y-1">
                                {navLinks.map((link) => {
                                    const isActive = activeSection === link.href.replace("#", "");
                                    return (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => {
                                                setActiveSection(link.href.replace("#", ""));
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                                                isActive
                                                    ? "text-white bg-white/[0.08] font-semibold"
                                                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            {link.label}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Main Sections ── */}
                <main className="relative z-10">
                    <HomeSection
                        home={portfolio.home || {}}
                    />

                    {/* Subtle Monochrome Divider */}
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <SkillsSection skills={portfolio.user_skills ?? portfolio.userSkills ?? []} />

                    {/* Subtle Monochrome Divider */}
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <ExperienceSection experiences={portfolio.experiences || []} />

                    {/* Subtle Monochrome Divider */}
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <ProjectsSection projects={portfolio.projects || []} />

                    {/* Subtle Monochrome Divider */}
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <ContactSection
                        contacts={portfolio.contacts || {}}
                        sosmedLinks={portfolio.home?.social_media_links || {}}
                    />
                </main>

                {/* ── Minimalist Elegant Footer ── */}
                <footer className="w-full border-t border-white/[0.08] py-6 px-4 relative z-10 bg-black">
                    <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-white font-mono text-sm font-bold tracking-wider">
                                {portfolio.home?.name || "PORTFOLIO"}
                            </span>
                            <span className="text-neutral-400 text-xs font-mono">
                                / Software Engineer
                            </span>
                        </div>
                        <div className="text-neutral-400 text-xs font-mono">
                            © {new Date().getFullYear()} {env.name}. All rights reserved.
                        </div>
                {/*                         
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                            aria-label="Back to Top"
                        >
                            <span>Top</span>
                            <HiArrowUp className="w-3.5 h-3.5" />
                        </button> */}
                    </div>
                </footer>
            </div>
        </>
    );
}