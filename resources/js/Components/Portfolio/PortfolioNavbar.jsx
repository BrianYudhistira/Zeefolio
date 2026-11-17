import { HiBars3, HiXMark } from "react-icons/hi2";

export default function PortfolioNavbar({
    appName,
    navLinks = [],
    isScrolled = false,
    activeSection = "home",
    setActiveSection,
    mobileMenuOpen = false,
    setMobileMenuOpen,
}) {
    const resolvedName = appName || import.meta.env.VITE_APP_NAME || "ZeeFolio";
    const brandSuffix =
        resolvedName.toLowerCase() === "zeefolio" ? "eeFolio" : resolvedName;

    return (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-center py-4 sm:py-6 px-4 pointer-events-none">
            <nav
                className={`pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between gap-6 px-5 sm:px-6 py-2.5 sm:py-3 ${isScrolled
                    ? "bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                    : "bg-black/30 backdrop-blur-md border border-white/[0.06]"
                    } max-w-[90%] sm:max-w-fit`}
            >
                {/* Brand Logo */}
                <a
                    href="#home"
                    aria-label={resolvedName}
                    className="flex items-center font-bold tracking-tight text-white group"
                >
                    <img
                        src="/images/web_icon.png"
                        alt=""
                        className="h-8 w-8 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 shrink-0"
                    />
                    <span className="-ml-1.5 text-sm sm:text-base font-mono tracking-wider leading-none hidden sm:inline">
                        {brandSuffix}
                    </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1 sm:gap-2">
                    {navLinks.map((link) => {
                        const isActive =
                            activeSection === link.href.replace("#", "");
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() =>
                                    setActiveSection(link.href.replace("#", ""))
                                }
                                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${isActive
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
                            const isActive =
                                activeSection === link.href.replace("#", "");
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => {
                                        setActiveSection(
                                            link.href.replace("#", "")
                                        );
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${isActive
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
    );
}

