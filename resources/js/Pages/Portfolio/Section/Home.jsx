import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import TextType from "@/Components/Animations/Text/TextType";
import Magnet from "@/components/Animations/UI/Magnet";

export default function HomeSection({ home }) {
    return (
        <section
            id="home"
            className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 z-50 font-retro-mono "
            >
            <div className="max-w-[80%] 2xl:max-w-[85%] mx-auto w-full xl:mt-18">
                <div className="flex flex-col xl:flex-row justify-between gap-5 items-center">
                    <div className="w-full xl:w-1/2 space-y-4 xl:space-y-7 text-center xl:text-left order-2 xl:order-1">
                        <AnimatedContent
                            distance={100}
                            direction="horizontal"
                            reverse={true}
                            duration={2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1.1}
                            threshold={0.1}
                            delay={0}
                        >
                            <p>
                                <span className="text-xl sm:text-2xl xl:text-2xl 2xl:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-700 relative transition-all duration-300 font-retro-pixel tracking-wider">
                                    {home.greeting}
                                </span>
                            </p>

                            <div className="relative leading-none">
                                <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
                                    <p className="text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-700 relative transition-all duration-300 font-retro-pixel tracking-wider">
                                        {home.name}
                                    </p>
                                </div>
                            </div>

                            <p className="text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-700 relative transition-all duration-300 font-retro-pixel tracking-wider">
                                {home.name}
                            </p>
                        </AnimatedContent>

                        <AnimatedContent
                            distance={100}
                            direction="horizontal"
                            reverse={true}
                            duration={1.5}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0}
                        >
                            <TextType
                                text={home.passions}
                                typingSpeed={120}
                                pauseDuration={2000}
                                showCursor={true}
                                cursorCharacter="|"
                                className="text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold text-white/90 relative z-10 leading-none py-2 transition-all duration-300 font-retro-mono"
                            />
                        </AnimatedContent>

                        <AnimatedContent
                            distance={100}
                            direction="vertical"
                            reverse={false}
                            duration={1.5}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0}
                        >
                            <p className="text-sm xl:text-base 2xl:text-xl font-medium mt-2 text-white/90 leading-relaxed transition-all duration-300 font-retro-mono">
                               {home.description}
                            </p>
                        </AnimatedContent>

                        <AnimatedContent
                            distance={100}
                            direction="vertical"
                            reverse={false}
                            duration={1.5}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0}
                            delay={0}
                        >
                            <div className="flex justify-center mt-2 mb-10 xl:mb-0 xl:justify-start gap-2 sm:gap-4 md:gap-6 flex-wrap relative z-50 transition-all duration-300">
                                <a
                                    href={home.social_media_links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-cyan-200 bg-[#0a1b2e] border-2 border-cyan-400 transition-all duration-200 group"
                                    aria-label="LinkedIn Profile"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 group-hover:text-[#0077B5] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>

                                <a
                                    href={home.social_media_links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-cyan-200 bg-[#0a1b2e] border-2 border-cyan-400 transition-all duration-200 group"
                                    aria-label="GitHub Profile"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>

                                <a
                                    href={home.social_media_links.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-cyan-200 bg-[#0a1b2e] border-2 border-cyan-400 transition-all duration-200 group"
                                    aria-label="Instagram Profile"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 group-hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </AnimatedContent>
                    </div>

                    <div className="w-full lg:w-1/2 flex justify-center xl:justify-end order-1 2xl:order-2 mt-20 mb-5 xl:mb-0 xl:mt-0">
                        <AnimatedContent
                            distance={100}
                            direction="horizontal"
                            reverse={false}
                            duration={1.5}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0}
                        >
                            <Magnet padding={50} disabled={false} magnetStrength={3}>
                                <img
                                    src={`/${home.logo_path}`}
                                    alt="Home Main Illustration"
                                    className="w-52 sm:w-60 md:w-72 lg:w-80 2xl:w-[420px] hover:scale-110 object-contain transition-transform duration-500"
                                />
                            </Magnet>
                        </AnimatedContent>
                    </div>
                </div>
            </div>
        </section>
    );
}