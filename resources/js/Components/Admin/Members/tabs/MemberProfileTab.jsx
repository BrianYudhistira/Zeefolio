export default function MemberProfileTab({ selectedMember }) {
    if (!selectedMember.has_portfolio) {
        return (
            <p className="text-xs text-zinc-500 py-6 text-center">
                This member has not set up a portfolio yet.
            </p>
        );
    }

    const experiences = selectedMember.portfolio?.experiences || [];

    return (
        <div className="space-y-5">
            <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
                <p className="text-xs text-zinc-500">
                    {selectedMember.portfolio?.home?.greeting || "Hello, I am"}{" "}
                    <span className="text-zinc-200 font-medium">
                        {selectedMember.portfolio?.home?.name ||
                            selectedMember.name}
                    </span>
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedMember.portfolio?.home?.description ||
                        "No bio description provided."}
                </p>
            </div>

            <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Experiences ({experiences.length})
                </h4>
                {experiences.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                        No experience entries added.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {experiences.map((exp) => (
                            <div
                                key={exp.id}
                                className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-zinc-200 truncate">
                                        {exp.position}
                                    </p>
                                    <p className="text-zinc-500 truncate">
                                        {exp.company}
                                    </p>
                                </div>
                                <span className="text-zinc-400 shrink-0 tabular-nums">
                                    {exp.date}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
