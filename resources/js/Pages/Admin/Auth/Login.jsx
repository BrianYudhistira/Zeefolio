import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineLockClosed,
    HiArrowRight,
    HiCheck,
} from "react-icons/hi2";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.login.store"));
    };

    return (
        <>
            <Head title="Admin Login - Zeefolio" />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans flex flex-col justify-between px-4 py-8 sm:py-12">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-white/[0.05] via-white/[0.015] to-transparent blur-3xl" />
                </div>

                {/* Login Card */}
                <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
                    <AnimatedContent
                        distance={40}
                        direction="vertical"
                        reverse={false}
                        duration={0.9}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.1}
                    >
                        <div className="rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                                    Welcome Back
                                </h1>
                                <p className="text-xs sm:text-sm text-neutral-400">
                                    Sign in to manage your portfolio, projects, and system activity.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-mono tracking-wider uppercase text-neutral-300"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <HiOutlineEnvelope className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="admin@example.com"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            className="w-full text-sm pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs font-mono text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-mono tracking-wider uppercase text-neutral-300"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <HiOutlineLockClosed className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            className="w-full text-sm pl-11 pr-11 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <HiOutlineEyeSlash className="w-4 h-4" />
                                            ) : (
                                                <HiOutlineEye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs font-mono text-red-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="inline-flex items-center gap-2.5 cursor-pointer group select-none">
                                        <span className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData("remember", e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <span
                                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-white/40 ${
                                                    data.remember
                                                        ? "bg-white border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                                        : "bg-white/[0.04] border-white/25 text-transparent group-hover:border-white/40"
                                                }`}
                                            >
                                                <HiCheck className="w-3 h-3 stroke-[2.5]" />
                                            </span>
                                        </span>
                                        <span
                                            className={`text-xs font-mono transition-colors ${
                                                data.remember
                                                    ? "text-neutral-200"
                                                    : "text-neutral-400 group-hover:text-neutral-200"
                                            }`}
                                        >
                                            Keep me signed in
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3.5 px-6 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] ${processing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                >
                                    <span>{processing ? "Authenticating..." : "Sign In"}</span>
                                    <HiArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Footer Link */}
                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-xs text-neutral-400">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href={route("admin.register")}
                                        className="font-mono text-white hover:underline uppercase tracking-wider ml-1"
                                    >
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </div>
        </>
    );
}

