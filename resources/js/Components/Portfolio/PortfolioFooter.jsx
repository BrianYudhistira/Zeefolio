import { Link } from "@inertiajs/react";
import { FaGithub } from "react-icons/fa6";
import { HiArrowRight } from "react-icons/hi2";

const PLATFORM_AUTHOR_NAME = "Brian Yudhistira";
const PLATFORM_GITHUB_URL = "https://github.com/BrianYudhistira";
const PLATFORM_REPO_URL = "https://github.com/BrianYudhistira/Zeee-Hub";

const FOCUS_RING =
    "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export default function PortfolioFooter({
    appName,
}) {
    const platformName = appName || import.meta.env.VITE_APP_NAME || "ZeeFolio";
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/[0.08] py-6 relative z-10 bg-black mt-auto">
            <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
                {/* Credit */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-center md:text-left">
                    <span>
                        © {currentYear} {platformName}
                    </span>
                    <span
                        aria-hidden="true"
                        className="hidden sm:inline-block h-3 w-px bg-white/10"
                    />
                    <span>
                        Created by{" "}
                        <a
                            href={PLATFORM_GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-neutral-200 hover:text-white underline-offset-4 hover:underline transition-colors ${FOCUS_RING}`}
                            aria-label={`${PLATFORM_AUTHOR_NAME} on GitHub (opens in a new tab)`}
                        >
                            {PLATFORM_AUTHOR_NAME}
                        </a>
                    </span>
                </div>

                {/* GitHub & CTA */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2">
                    <a
                        href={PLATFORM_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors ${FOCUS_RING}`}
                        aria-label="ZeeFolio source on GitHub (opens in a new tab)"
                    >
                        <FaGithub className="w-3.5 h-3.5 shrink-0" />
                        <span>GitHub</span>
                    </a>

                    <span
                        aria-hidden="true"
                        className="hidden sm:inline-block h-3 w-px bg-white/10"
                    />

                    <Link
                        href={route("admin.register")}
                        className={`group inline-flex items-center gap-1.5 text-neutral-200 hover:text-white underline-offset-4 hover:underline transition-colors ${FOCUS_RING}`}
                        aria-label="Create your own portfolio"
                    >
                        <span>Create your own portfolio</span>
                        <HiArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
