import { HiOutlineMagnifyingGlass, HiXMark } from "react-icons/hi2";

export default function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    className = "w-full sm:w-64",
}) {
    return (
        <div className={`relative ${className}`}>
            <HiOutlineMagnifyingGlass className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs pl-9 pr-8 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-500 outline-none"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    aria-label="Clear search"
                >
                    <HiXMark className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

