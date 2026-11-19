import { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AdminAuthLayout from "@/Layouts/AdminAuthLayout";
import {
    HiOutlineEnvelope,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineLockClosed,
    HiArrowRight,
    HiCheck,
} from "react-icons/hi2";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.login.store"), {
            onError: () => reset("password"),
        });
    };

    return (
        <AdminAuthLayout
            headTitle="Sign In"
            title="Sign In"
            subtitle="Sign in to manage your portfolio, projects, and activity."
            footer={
                <p className="text-xs text-[var(--text-muted)]">
                    Don&apos;t have an account?{" "}
                    <Link
                        href={route("admin.register")}
                        className="font-medium text-[var(--orange-text)] hover:underline ml-1"
                    >
                        Create Account
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="login-email"
                        className="block text-xs font-medium text-[var(--text)]"
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <HiOutlineEnvelope
                            className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            aria-hidden="true"
                        />
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            className="admin-input w-full text-sm pl-10 pr-3.5 py-2.5 rounded-lg border outline-none transition-colors"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-[var(--danger)]">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="login-password"
                        className="block text-xs font-medium text-[var(--text)]"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <HiOutlineLockClosed
                            className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            aria-hidden="true"
                        />
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            aria-invalid={Boolean(errors.password)}
                            className="admin-input w-full text-sm pl-10 pr-11 py-2.5 rounded-lg border outline-none transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                        >
                            {showPassword ? (
                                <HiOutlineEyeSlash className="w-4 h-4" />
                            ) : (
                                <HiOutlineEye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-[var(--danger)]">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                    <label className="inline-flex items-center gap-2.5 py-1.5 pr-2 cursor-pointer group select-none">
                        <span className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="peer sr-only"
                            />
                            <span
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--orange)] ${
                                    data.remember
                                        ? "bg-[var(--orange)] border-[var(--orange)] text-[var(--on-accent)]"
                                        : "bg-[var(--bg)] border-[var(--border-strong)] text-transparent group-hover:border-[var(--orange)]"
                                }`}
                            >
                                <HiCheck className="w-3 h-3 stroke-[2.5]" />
                            </span>
                        </span>
                        <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                            Keep me signed in
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="admin-btn-primary admin-btn-lg w-full transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    <span>{processing ? "Signing in..." : "Sign In"}</span>
                    <HiArrowRight className="w-4 h-4" />
                </button>
            </form>
        </AdminAuthLayout>
    );
}
