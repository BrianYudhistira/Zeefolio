import { getDeviconClass } from "@/Utils/devicon";

export default function DeviconIcon({
    icon,
    name = "",
    sizeClass = "text-base sm:text-lg",
    fallbackClass = "text-xs font-semibold text-zinc-400",
}) {
    const devicon = getDeviconClass(icon);

    if (devicon) {
        return <i className={`${devicon} ${sizeClass}`} />;
    }

    return (
        <span className={fallbackClass}>
            {name ? name.slice(0, 2).toUpperCase() : "—"}
        </span>
    );
}

