import { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AdminAuthLayout from "@/Layouts/AdminAuthLayout";
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

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.register.store"), {
            onError: () => reset("password"),
        });
    };

    return (
        <AdminAuthLayout
            headTitle="Create Account"
            title="Create Account"
            subtitle="Set up your account to start building and managing your portfolio."
            maxWidthClass="max-w-lg"
            footer={
                <p className="text-xs text-[var(--text-muted)]">
                    Already have an account?{" "}
                    <Link
                        href={route("admin.login")}
                        className="font-medium text-[var(--orange-text)] hover:underline ml-1"
                    >
                        Sign In
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="register-name"
                            className="block text-xs font-medium text-[var(--text)]"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <HiOutlineUser
                                className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Alex Morgan"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                aria-invalid={Boolean(errors.name)}
                                className="admin-input w-full text-sm pl-10 pr-3.5 py-2.5 rounded-lg border outline-none transition-colors"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-[var(--danger)]">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="register-username"
                            className="block text-xs font-medium text-[var(--text)]"
                        >
                            Username{" "}
                            <span className="text-[var(--text-muted)] font-normal">
                                (Optional)
                            </span>
                        </label>
                        <div className="relative">
                            <HiOutlineAtSymbol
                                className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                autoComplete="username"
                                placeholder="alexmorgan"
                                value={data.username}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                                aria-invalid={Boolean(errors.username)}
                                className="admin-input w-full text-sm pl-10 pr-3.5 py-2.5 rounded-lg border outline-none transition-colors"
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-[var(--danger)]">
                                {errors.username}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-email"
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
                            id="register-email"
                            type="email"
                            name="email"
                            required
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
                        htmlFor="register-password"
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
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
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

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="admin-btn-primary admin-btn-lg w-full transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    <span>
                        {processing ? "Creating Account..." : "Create Account"}
                    </span>
                    <HiArrowRight className="w-4 h-4" />
                </button>
            </form>
        </AdminAuthLayout>
    );
}
