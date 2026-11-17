import { useEffect, useState } from "react";
import PortfolioNavbar from "@/Components/Portfolio/PortfolioNavbar";
import HomeSection from "@/Components/Portfolio/Sections/Home";
import SkillsSection from "@/Components/Portfolio/Sections/Skills";
import ExperienceSection from "@/Components/Portfolio/Sections/Experience";
import ProjectsSection from "@/Components/Portfolio/Sections/Project";
import ContactSection from "@/Components/Portfolio/Sections/Contact";
import PortfolioFooter from "@/Components/Portfolio/PortfolioFooter";
import SeoHead from "@/Components/Portfolio/SeoHead";

const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#skills", label: "Skills" },
    { href: "#experience", label: "Experience" },
    { href: "#project", label: "Projects" },
    { href: "#contact", label: "Contact" },
];

function SectionDivider() {
    return (
        <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}

export default function Portfolio({
    portfolio,
    portfolioSlug,
    selectedSkillCategories = [],
    seo = null,
}) {
    const appName = import.meta.env.VITE_APP_NAME;
    const resolvedSlug = portfolioSlug || portfolio?.slug || "brian-yudhistira";
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            const isBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 60;

            if (isBottom) {
                setActiveSection(sectionIds[sectionIds.length - 1]);
                return;
            }

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

    if (!portfolio) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400 font-mono">
                Loading portfolio data...
            </div>
        );
    }

    return (
        <>
            <SeoHead
                seo={seo}
                fallbackTitle={portfolio.home?.name || "Portfolio"}
            />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans">
                <PortfolioNavbar
                    appName={appName}
                    navLinks={navLinks}
                    isScrolled={isScrolled}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                <main className="relative z-10">
                    <HomeSection home={portfolio.home || {}} />
                    <SectionDivider />
                    <SkillsSection
                        skills={
                            portfolio.user_skills ?? portfolio.userSkills ?? []
                        }
                        selectedCategories={
                            selectedSkillCategories?.length
                                ? selectedSkillCategories
                                : portfolio.selected_skill_categories ||
                                portfolio.skill_categories ||
                                []
                        }
                    />
                    <SectionDivider />
                    <ExperienceSection
                        experiences={portfolio.experiences || []}
                    />
                    <SectionDivider />
                    <ProjectsSection
                        projects={portfolio.projects || []}
                        portfolioSlug={resolvedSlug}
                    />
                    <SectionDivider />
                    <ContactSection
                        contacts={portfolio.contacts || {}}
                        sosmedLinks={portfolio.home?.social_media_links || {}}
                        portfolioSlug={resolvedSlug}
                    />
                </main>

                <PortfolioFooter appName={appName} />
            </div>
        </>
    );
}