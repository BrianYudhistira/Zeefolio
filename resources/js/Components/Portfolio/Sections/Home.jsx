import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import TextType from "@/Components/Animations/Text/TextType";
import Magnet from "@/Components/Animations/UI/Magnet";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa6";
import { HiArrowUpRight, HiOutlineDocumentArrowDown } from "react-icons/hi2";

export default function HomeSection({ home }) {
    // Profile image: uses home.image_path (merged from former About table)
    const photoSrc = home?.image_path
        ? `/storage/${home.image_path}`
        : home?.logo_path
            ? `/${home.logo_path}`
            : null;

    return (
        <section
            id="home"
            className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 lg:py-0"
        >
            <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full">
                <div className="flex flex-col xl:flex-row justify-between gap-12 lg:gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="w-full xl:w-7/12 space-y-6 text-center xl:text-left order-2 xl:order-1">
                        {/* Status Badge */}
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
                            delay={0}
                        >
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400">
                                    Available for opportunities
                                </span>
                            </div>
                        </AnimatedContent>

                        {/* Greeting & Name */}
                        <AnimatedContent
                            distance={60}
                            direction="horizontal"
                            reverse={true}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.1}
                        >
                            <div className="space-y-2">
                                <p className="text-sm sm:text-base font-mono tracking-[0.25em] text-neutral-400 uppercase">
                                    {home.greeting || "Hello, I am"}
                                </p>
                                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white">
                                    {home.name}
                                </h1>
                            </div>
                        </AnimatedContent>

                        {/* Dynamic Roles / Passions */}
                        <AnimatedContent
                            distance={60}
                            direction="horizontal"
                            reverse={true}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.2}
                        >
                            <div className="py-1">
                                <TextType
                                    text={home.passions}
                                    typingSpeed={100}
                                    pauseDuration={2000}
                                    showCursor={true}
                                    cursorCharacter="_"
                                    className="text-lg sm:text-2xl lg:text-3xl font-mono text-neutral-300 font-medium"
                                />
                            </div>
                        </AnimatedContent>

                        {/* Description */}
                        <AnimatedContent
                            distance={50}
                            direction="vertical"
                            reverse={false}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.3}
                        >
                            <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto xl:mx-0">
                                {home.description}
                            </p>
                        </AnimatedContent>

                        {/* Action Buttons & Socials */}
                        <AnimatedContent
                            distance={40}
                            direction="vertical"
                            reverse={false}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0}
                            delay={0.4}
                        >
                            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3.5 pt-2">
                                {/* Primary CTA */}
                                <a
                                    href="#project"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.15)] group"
                                >
                                    <span>Explore Works</span>
                                    <HiArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>

                                {/* Download CV Button if available */}
                                {home?.cv_path && (
                                    <a
                                        href={`/storage/${home.cv_path}`}
                                        download="Resume.pdf"
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/25 text-sm font-medium transition-all duration-300 backdrop-blur-md group"
                                    >
                                        <HiOutlineDocumentArrowDown className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                                        <span>Download CV</span>
                                    </a>
                                )}

                                {/* Vertical Divider */}
                                <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

                                {/* Social Links */}
                                <div className="flex items-center gap-2">
                                    {home.social_media_links?.linkedin && (
                                        <a
                                            href={home.social_media_links.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="LinkedIn"
                                        >
                                            <FaLinkedinIn className="w-4 h-4" />
                                        </a>
                                    )}

                                    {home.social_media_links?.github && (
                                        <a
                                            href={home.social_media_links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="GitHub"
                                        >
                                            <FaGithub className="w-4 h-4" />
                                        </a>
                                    )}

                                    {home.social_media_links?.instagram && (
                                        <a
                                            href={home.social_media_links.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="Instagram"
                                        >
                                            <FaInstagram className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>

                    {/* Right Column - User's Real Photo in Elegant Glass Portrait Frame (No Filters) */}
                    <div className="w-full xl:w-5/12 flex justify-center xl:justify-end order-1 xl:order-2">
                        <AnimatedContent
                            distance={60}
                            direction="horizontal"
                            reverse={false}
                            duration={1.4}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.2}
                        >
                            <Magnet padding={40} disabled={false} magnetStrength={2.5}>
                                <div className="relative group">
                                    {/* Ambient Glow behind portrait */}
                                    <div className="absolute inset-0 rounded-3xl bg-white/[0.05] blur-3xl scale-95 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                                    {/* Glass Portrait Frame */}
                                    <div className="relative w-[280px] sm:w-[320px] md:w-[360px] 2xl:w-[400px] aspect-[4/5] rounded-3xl p-3 bg-white/[0.02] border border-white/10 backdrop-blur-xl group-hover:border-white/25 transition-all duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                                        {/* Subtle corner accents */}
                                        <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-white/30 rounded-tr-lg pointer-events-none" />
                                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-white/30 rounded-bl-lg pointer-events-none" />

                                        {/* Real Image container - Raw Authentic Colors (No grayscale/filters) */}
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900">
                                            {photoSrc && (
                                                <img
                                                    src={photoSrc}
                                                    alt={home.name || "Portrait"}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="eager"
                                                />
                                            )}
                                            {/* Soft subtle bottom vignette for glass integration */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </Magnet>
                        </AnimatedContent>
                    </div>
                </div>
            </div>
        </section>
    );
}