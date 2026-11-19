import { Head, Link, usePage } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { useAdminTheme } from "@/Hooks/useAdminTheme";
import { getBrandSuffix } from "@/Utils/permissionHelpers";
import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from "react-icons/hi2";

export default function AdminAuthLayout({
    headTitle,
    title = null,
    subtitle,
    maxWidthClass = "max-w-md",
    footer,
    children,
}) {
    const { theme } = useAdminTheme();
    const { flash } = usePage().props;
    const appName = import.meta.env.VITE_APP_NAME || "ZeeFolio";
    const brandSuffix = getBrandSuffix(appName);

    return (
        <>
            <Head title={headTitle} />

            <div
                data-theme={theme}
                className="admin-theme admin-auth-shell w-full antialiased min-h-screen relative font-sans flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
            >
                <main className={`relative z-10 w-full ${maxWidthClass} mx-auto`}>
                    <AnimatedContent
                        distance={30}
                        direction="vertical"
                        reverse={false}
                        duration={0.75}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.1}
                    >
                        <div className="admin-auth-card rounded-2xl border p-6 sm:p-8">
                            {/* Brand & Heading */}
                            <div className="mb-6 text-center">
                                <div className="flex justify-center mb-2">
                                    <Link
                                        href="/"
                                        aria-label={appName}
                                        className="admin-brand-link inline-flex items-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] rounded-lg"
                                    >
                                        <img
                                            src="/images/web_icon.png"
                                            alt=""
                                            className="admin-brand-icon admin-auth-brand-icon object-contain shrink-0"
                                        />
                                        <span className="admin-brand-text admin-auth-brand-text tracking-tight leading-none">
                                            {brandSuffix}
                                        </span>
                                    </Link>
                                </div>
                                {title && (
                                    <h1 className="text-base sm:text-lg font-semibold text-[var(--text)] mt-2">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {flash?.success && (
                                <div
                                    role="status"
                                    className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300"
                                >
                                    <HiOutlineCheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{flash.success}</span>
                                </div>
                            )}

                            {flash?.error && (
                                <div
                                    role="alert"
                                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400"
                                >
                                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{flash.error}</span>
                                </div>
                            )}

                            {children}

                            {footer && (
                                <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </AnimatedContent>
                </main>
            </div>
        </>
    );
}
