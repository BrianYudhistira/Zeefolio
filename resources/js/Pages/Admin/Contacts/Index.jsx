import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineMapPin,
} from "react-icons/hi2";

export default function ContactsIndex({ contact = {} }) {
    const { data, setData, put, processing, errors } = useForm({
        email: contact?.email || "",
        phone: contact?.phone || "",
        address: contact?.address || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.contacts.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Contact Info" />

            <div className="max-w-2xl">
                <form
                    onSubmit={handleSubmit}
                    className="admin-card rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-5"
                >
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Contact Details
                        </h2>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                            Details shown in the contact section of your portfolio.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="contact-email"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <HiOutlineEnvelope
                                className="w-4 h-4 text-[var(--orange-text)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                id="contact-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="you@example.com"
                                aria-invalid={Boolean(errors.email)}
                                className="admin-input w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg border outline-none transition-colors"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-400">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="contact-phone"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Phone / WhatsApp Number
                        </label>
                        <div className="relative">
                            <HiOutlinePhone
                                className="w-4 h-4 text-[var(--emerald)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                id="contact-phone"
                                type="tel"
                                maxLength={20}
                                autoComplete="tel"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="+62 812 3456 7890"
                                aria-invalid={Boolean(errors.phone)}
                                className="admin-input w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg border outline-none transition-colors"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-400">{errors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="contact-address"
                            className="block text-xs font-medium text-zinc-300"
                        >
                            Location / Address
                        </label>
                        <div className="relative">
                            <HiOutlineMapPin
                                className="w-4 h-4 text-[var(--indigo)] absolute left-3.5 top-3 pointer-events-none"
                                aria-hidden="true"
                            />
                            <textarea
                                id="contact-address"
                                rows={3}
                                maxLength={500}
                                autoComplete="street-address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                placeholder="Jakarta, Indonesia"
                                aria-invalid={Boolean(errors.address)}
                                className="admin-input w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg border outline-none transition-colors"
                            />
                        </div>
                        {errors.address && (
                            <p className="text-xs text-red-400">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <div className="pt-1 sm:pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="admin-btn-primary admin-btn-lg inline-flex items-center justify-center w-full sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

ContactsIndex.layout = (page) => (
    <AdminLayout title="Contact Info">{page}</AdminLayout>
);
