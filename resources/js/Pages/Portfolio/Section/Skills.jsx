import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";

function normalizeSkillsInput(userSkills) {
    const skillsData = userSkills?.data ?? userSkills;

    if (!skillsData || (Array.isArray(skillsData) && skillsData.length === 0)) {
        return [];
    }

    const groups = new Map();

    const addSkill = (category, value) => {
        const techStack = typeof value === 'string' ? { name: value } : value;
        const label = typeof category === 'object' ? category?.name : category;
        const name = techStack?.name ?? '';

        if (!name || !label) return;

        if (!groups.has(label)) groups.set(label, []);

        groups.get(label).push({
            name,
            icon: techStack?.icon ?? null,
        });
    };

    if (Array.isArray(skillsData)) {
        skillsData.forEach((entry) => {
            const techStack = entry?.tech_stack ?? entry?.techStack ?? null;
            addSkill(techStack?.category ?? 'database', techStack);
        });
    } else {
        Object.entries(skillsData).forEach(([category, techStacks]) => {
            if (Array.isArray(techStacks)) {
                techStacks.forEach((techStack) => addSkill(category, techStack));
            }
        });
    }

    return Array.from(groups.entries())
        .map(([label, items]) => ({
            label,
            items: items.filter((skill, index, all) =>
                all.findIndex((item) => item.name === skill.name) === index
            ),
        }))
        .slice(0, 3);
}

export default function SkillsSection({ skills }) {
    const getDeviconClass = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('devicon-')) return `${icon} colored`;
        return `devicon-${icon}-plain colored`;
    };

    const skillCategories = normalizeSkillsInput(skills);

    return (
        <section id="skills" className="relative w-full py-24 sm:py-32 scroll-mt-16">
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
                            01 // CAPABILITIES
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                            Skills & Technologies
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                            The languages, frameworks, and engineering tools I utilize to craft scalable software.
                        </p>
                    </AnimatedContent>
                </div>

                {skillCategories.length === 0 && (
                    <div className="text-center text-neutral-500 font-mono text-sm py-12">
                        No skills data currently available.
                    </div>
                )}

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {skillCategories.map((category, catIdx) => (
                        <AnimatedContent
                            key={category.label}
                            distance={50}
                            direction="vertical"
                            reverse={false}
                            duration={1}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={catIdx * 0.15}
                        >
                            <div className="h-full rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-7 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col">
                                {/* Header badge */}
                                <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/[0.08]">
                                    <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-mono">
                                        {category.label}
                                    </h3>
                                    <span className="text-xs font-mono text-neutral-400">
                                        0{catIdx + 1}
                                    </span>
                                </div>

                                {/* Skills list */}
                                <div className="flex flex-wrap gap-2.5">
                                    {category.items.map((skill, idx) => (
                                        <div
                                            key={`${skill.name}-${idx}`}
                                            className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300 cursor-default"
                                        >
                                            {skill.icon && (
                                                <i className={`${getDeviconClass(skill.icon)} text-base`} />
                                            )}
                                            <span className="text-xs font-mono text-neutral-300 group-hover:text-white transition-colors duration-300">
                                                {skill.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </section>
    );
}
