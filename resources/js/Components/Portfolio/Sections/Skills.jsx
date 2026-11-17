import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { getDeviconClass } from "@/Utils/devicon";

function normalizeSkillsInput(userSkills, selectedCategories = []) {
    const skillsData = userSkills?.data ?? userSkills;
    const groups = new Map();

    const addSkill = (category, value) => {
        const techStack = typeof value === "string" ? { name: value } : value;
        const label = typeof category === "object" ? category?.name : category;
        const rawCategoryId =
            (typeof category === "object" && category?.id) ||
            techStack?.category_id ||
            null;
        const categoryId = rawCategoryId ? Number(rawCategoryId) : null;
        const name = techStack?.name ?? "";

        if (!name || !label) return;

        const key = String(label).trim().toLowerCase();
        if (!groups.has(key)) {
            groups.set(key, {
                id: categoryId,
                label: String(label).trim(),
                items: [],
            });
        } else if (!groups.get(key).id && categoryId) {
            groups.get(key).id = categoryId;
        }

        groups.get(key).items.push({
            name,
            icon: techStack?.icon ?? null,
        });
    };

    if (Array.isArray(skillsData)) {
        skillsData.forEach((entry) => {
            const techStack = entry?.tech_stack ?? entry?.techStack ?? null;
            addSkill(techStack?.category ?? "database", techStack);
        });
    } else if (skillsData && typeof skillsData === "object") {
        Object.entries(skillsData).forEach(([category, techStacks]) => {
            if (Array.isArray(techStacks)) {
                techStacks.forEach((techStack) => addSkill(category, techStack));
            }
        });
    }

    const deduplicateItems = (items) =>
        items.filter(
            (skill, index, all) =>
                all.findIndex((item) => item.name === skill.name) === index
        );

    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
        return selectedCategories
            .slice(0, 4)
            .map((cat) => {
                const isObject = typeof cat === "object" && cat !== null;
                const isNumeric =
                    !isObject &&
                    (typeof cat === "number" ||
                        (typeof cat === "string" && /^\d+$/.test(cat.trim())));

                const catId = isObject
                    ? cat?.id
                        ? Number(cat.id)
                        : null
                    : isNumeric
                      ? Number(cat)
                      : null;
                const catName = isObject
                    ? cat?.name
                    : isNumeric
                      ? null
                      : String(cat || "");
                const key = String(catName || "").trim().toLowerCase();

                let matched = key ? groups.get(key) : null;
                if (!matched && catId) {
                    matched = Array.from(groups.values()).find(
                        (g) => g.id === catId
                    );
                }

                if (!catName && !matched) {
                    return null;
                }

                return {
                    id: catId || matched?.id || null,
                    label: catName || matched?.label || "Skills",
                    items: deduplicateItems(matched?.items || []),
                };
            })
            .filter(Boolean);
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            items: deduplicateItems(group.items),
        }))
        .slice(0, 4);
}

function getGridClass(count) {
    switch (count) {
        case 1:
            return "grid-cols-1 max-w-2xl mx-auto";
        case 2:
            return "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
        case 4:
            return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
        default:
            return "grid-cols-1 md:grid-cols-3";
    }
}

export default function SkillsSection({ skills, selectedCategories = [] }) {
    const skillCategories = normalizeSkillsInput(skills, selectedCategories);
    const gridClass = getGridClass(skillCategories.length);

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

                {skillCategories.length === 0 ? (
                    <div className="text-center text-neutral-500 font-mono text-sm py-12">
                        No skills data currently available.
                    </div>
                ) : (
                    <div className={`grid gap-6 lg:gap-8 ${gridClass}`}>
                        {skillCategories.map((category, catIdx) => (
                            <AnimatedContent
                                key={category.id || category.label}
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
                                    {category.items.length === 0 ? (
                                        <p className="text-xs font-mono text-neutral-500 py-2">
                                            No skills added yet.
                                        </p>
                                    ) : (
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
                                    )}
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
