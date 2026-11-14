import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { useEffect, useRef, useState } from "react";
import { HiOutlineBuildingOffice2, HiArrowTopRightOnSquare } from "react-icons/hi2";

function getDeviconClass(icon) {
    if (!icon) return null;
    if (icon.startsWith('devicon-')) return `${icon} colored`;
    return `devicon-${icon}-plain colored`;
}

function TimelineConnector({ isVisible }) {
    return (
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden lg:block">
            <div
                className={`w-[1px] h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            />
        </div>
    );
}

function TimelineDot() {
    return (
        <div className="absolute left-1/2 top-8 -translate-x-1/2 z-20 hidden lg:flex items-center justify-center">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-6 h-6 rounded-full bg-white/10 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
        </div>
    );
}

function formatPeriod(startDate, endDate) {
    const formatOptions = { month: "short", year: "numeric" };
    const start = startDate ? new Date(startDate).toLocaleDateString("en-US", formatOptions) : "";
    const end = endDate ? new Date(endDate).toLocaleDateString("en-US", formatOptions) : "Present";

    if (!start) {
        return end;
    }

    return `${start} - ${end}`;
}

function normalizeExperience(experience) {
    const rawSkills = experience.tech_stacks
        ? experience.tech_stacks
        : (experience.skills ?? experience.tech_stack ?? []);

    const skills = Array.isArray(rawSkills)
        ? rawSkills.map(s => typeof s === 'object' ? s : { name: s, icon: null })
        : String(rawSkills)
            .split(",")
            .map((skill) => ({ name: skill.trim(), icon: null }))
            .filter((s) => s.name);

    return {
        ...experience,
        role: experience.role ?? experience.position ?? "Experience",
        period: experience.period ?? formatPeriod(experience.start_date, experience.end_date),
        skills,
        description: experience.description ?? "",
    };
}

function ExperienceCard({ experience, isLeft }) {
    return (
        <div
            className={`w-full lg:w-[calc(50%-2.5rem)] ${isLeft ? "lg:mr-auto lg:pr-2" : "lg:ml-auto lg:pl-2"
                }`}
        >
            <AnimatedContent
                distance={60}
                direction="horizontal"
                reverse={isLeft}
                duration={1.2}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.15}
                delay={0.1}
            >
                <div className="group relative">
                    {/* Connector line from dot to card (desktop only) */}
                    <div
                        className={`hidden lg:block absolute top-9 ${isLeft
                            ? "right-0 translate-x-[calc(100%+0.25rem)]"
                            : "left-0 -translate-x-[calc(100%+0.25rem)]"
                            } w-9 h-[1px] bg-gradient-to-r from-white/30 to-white/10`}
                    />

                    {/* Card container */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04]">
                        <div className="relative z-10 space-y-3">
                            {/* Period Badge */}
                            <span className="inline-block px-3 py-1 text-xs font-mono text-neutral-400 bg-white/[0.03] border border-white/10 rounded-full">
                                {experience.period}
                            </span>

                            {/* Role */}
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                {experience.role}
                            </h3>

                            {/* Company */}
                            <p className="text-xs sm:text-sm font-mono text-neutral-400 flex items-center gap-2">
                                <HiOutlineBuildingOffice2 className="w-4 h-4 text-neutral-400" />
                                {experience.company}
                            </p>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-1">
                                {experience.description}
                            </p>

                            {/* Skills Pills */}
                            {experience.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {experience.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                        >
                                            {skill.icon && <i className={`${getDeviconClass(skill.icon)} text-[12px]`} />}
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Certificate Link */}
                            {experience.certificate_path && (
                                <div className="flex justify-end pt-2 border-t border-white/[0.06]">
                                    <a
                                        href={`/storage/${experience.certificate_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors duration-200 group/link"
                                    >
                                        <span>View Certificate</span>
                                        <HiArrowTopRightOnSquare className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AnimatedContent>
        </div>
    );
}

export default function ExperienceSection({ experiences }) {
    const timelineRef = useRef(null);
    const [lineVisible, setLineVisible] = useState(false);

    const data = experiences && experiences.length > 0
        ? experiences.map(normalizeExperience)
        : [];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLineVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (timelineRef.current) {
            observer.observe(timelineRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section id="experience" className="relative w-full py-24 sm:py-32 scroll-mt-16">
            <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="mb-16 md:mb-20 text-center">
                    <AnimatedContent
                        distance={40}
                        direction="vertical"
                        reverse={true}
                        duration={1}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.15}
                        delay={0}
                    >
                        <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-3">
                            02 // EXPERIENCES
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                            Work Experience
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                            My professional track record, engineering roles, and achievements.
                        </p>
                    </AnimatedContent>
                </div>

                {data.length === 0 ? (
                    <div className="text-center text-neutral-500 font-mono text-sm py-12">
                        No experience records available.
                    </div>
                ) : (
                    <div ref={timelineRef} className="relative">
                        {/* Center vertical line (desktop) */}
                        <TimelineConnector isVisible={lineVisible} />

                        {/* Mobile vertical line (left side) */}
                        <div className="absolute left-4 top-0 bottom-0 lg:hidden">
                            <div
                                className={`w-[1px] h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent transition-opacity duration-1000 ${lineVisible ? "opacity-100" : "opacity-0"
                                    }`}
                            />
                        </div>

                        <div className="flex flex-col gap-10 md:gap-14">
                            {data.map((exp, index) => {
                                const isLeft = index % 2 === 0;

                                return (
                                    <div key={exp.id || index} className="relative">
                                        {/* Desktop dot on center line */}
                                        <TimelineDot />

                                        {/* Mobile dot on left line */}
                                        <div className="absolute left-4 top-8 -translate-x-1/2 z-20 lg:hidden flex items-center justify-center">
                                            <div className="relative flex items-center justify-center">
                                                <div className="absolute w-5 h-5 rounded-full bg-white/10 animate-ping" />
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                        </div>

                                        {/* Mobile: card with left padding */}
                                        <div className="lg:hidden pl-10">
                                            <AnimatedContent
                                                distance={40}
                                                direction="horizontal"
                                                reverse={false}
                                                duration={1}
                                                ease="power3.out"
                                                initialOpacity={0}
                                                animateOpacity
                                                scale={1}
                                                threshold={0.1}
                                                delay={0.1}
                                            >
                                                <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 space-y-3">
                                                    <span className="inline-block px-2.5 py-0.5 text-xs font-mono text-neutral-400 bg-white/[0.03] border border-white/10 rounded-full">
                                                        {exp.period}
                                                    </span>
                                                    <h3 className="text-base font-bold text-white tracking-tight">
                                                        {exp.role}
                                                    </h3>
                                                    <p className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                                                        <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                                                        {exp.company}
                                                    </p>
                                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                                        {exp.description}
                                                    </p>
                                                    {exp.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {exp.skills.map((skill, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 bg-white/[0.03] border border-white/[0.08] rounded-lg"
                                                                >
                                                                    {skill.icon && <i className={`${getDeviconClass(skill.icon)} text-[12px]`} />}
                                                                    {skill.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {exp.certificate_path && (
                                                        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
                                                            <a
                                                                href={`/storage/${exp.certificate_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-white"
                                                            >
                                                                View Certificate
                                                                <HiArrowTopRightOnSquare className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </AnimatedContent>
                                        </div>

                                        {/* Desktop: alternating left-right cards */}
                                        <div className="hidden lg:block">
                                            <ExperienceCard
                                                experience={exp}
                                                isLeft={isLeft}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}