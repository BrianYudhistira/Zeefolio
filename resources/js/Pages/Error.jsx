import { Head, Link } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi2";

const ERROR_CONFIG = {
    403: {
        code: "403",
        title: "Access Denied",
        description: "You do not have permission to access this resource.",
    },
    404: {
        code: "404",
        title: "Page Not Found",
        description:
            "The page you are looking for could not be found or is unavailable.",
    },
    419: {
        code: "419",
        title: "Page Expired",
        description: "Your session has expired. Please refresh and try again.",
    },
    500: {
        code: "500",
        title: "Server Error",
        description: "Something went wrong on our end. Please try again later.",
    },
    503: {
        code: "503",
        title: "Service Unavailable",
        description:
            "We are currently undergoing maintenance. Please check back shortly.",
    },
};

export default function ErrorPage({ status = 404 }) {
    const appName = import.meta.env.VITE_APP_NAME || "ZeeFolio";
    const details = ERROR_CONFIG[status] || ERROR_CONFIG[404];

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/";
        }
    };

    return (
        <>
            <Head title={`${details.code} - ${details.title} | ${appName}`} />

            <div className="w-full min-h-screen bg-black text-neutral-200 antialiased selection:bg-white selection:text-black relative font-sans flex items-center justify-center px-6 py-12">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-white/[0.05] via-white/[0.015] to-transparent blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <AnimatedContent
                        distance={30}
                        direction="vertical"
                        reverse={false}
                        duration={0.8}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.1}
                    >
                        <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter leading-none mb-3 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent select-none">
                            {details.code}
                        </h1>

                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2.5">
                            {details.title}
                        </h2>

                        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                            {details.description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors duration-200"
                            >
                                <HiOutlineHome className="w-4 h-4" />
                                Back to Home
                            </Link>
                        </div>
                    </AnimatedContent>
                </div>
            </div>
        </>
    );
}
