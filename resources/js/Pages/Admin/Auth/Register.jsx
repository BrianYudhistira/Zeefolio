import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiOutlineEnvelope,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineLockClosed,
    HiOutlineUser,
    HiOutlineAtSymbol,
    HiArrowRight,
} from "react-icons/hi2";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.register.store"));
    };

    return (
        <>
            <Head title="Admin Register - Zeefolio" />

            <div className="w-full bg-black text-neutral-200 antialiased selection:bg-white selection:text-black min-h-screen relative font-sans flex flex-col justify-between px-4 py-8 sm:py-12">
                {/* Subtle Ambient Background Lighting */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-white/[0.05] via-white/[0.015] to-transparent blur-3xl" />
                </div>

                {/* Register Card */}
                <div className="relative z-10 w-full max-w-lg mx-auto my-auto py-8">
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
                                    Create Account
                                </h1>
                                <p className="text-xs sm:text-sm text-neutral-400">
                                    Set up your administrator profile to access the dashboard.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name & Username */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="block text-xs font-mono tracking-wider uppercase text-neutral-300"
                                        >
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <HiOutlineUser className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                autoFocus
                                                placeholder="Alex Morgan"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                className="w-full text-sm pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-xs font-mono text-red-400">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="username"
                                            className="block text-xs font-mono tracking-wider uppercase text-neutral-300"
                                        >
                                            Username
                                        </label>
                                        <div className="relative">
                                            <HiOutlineAtSymbol className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                id="username"
                                                type="text"
                                                name="username"
                                                placeholder="alexmorgan"
                                                value={data.username}
                                                onChange={(e) => setData("username", e.target.value)}
                                                className="w-full text-sm pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-xs font-mono text-red-400">
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                            minLength={8}
                                            autoComplete="new-password"
                                            placeholder="Minimum 8 characters"
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3.5 px-6 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] ${processing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                >
                                    <span>{processing ? "Creating Account..." : "Create Account"}</span>
                                    <HiArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Footer Link */}
                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-xs text-neutral-400">
                                    Already have an account?{" "}
                                    <Link
                                        href={route("admin.login")}
                                        className="font-mono text-white hover:underline uppercase tracking-wider ml-1"
                                    >
                                        Sign In
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

