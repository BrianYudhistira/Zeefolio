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
        <AdminLayout title="Contacts">
            <Head title="Contacts - Zeefolio" />

            <div className="max-w-2xl">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-6 space-y-4 sm:space-y-5"
                >
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Direct Contact Information
                        </h2>
                        <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                            Update the contact channels displayed on your public portfolio.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Email Address
                        </label>
                        <div className="relative">
                            <HiOutlineEnvelope className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="you@example.com"
                                className="w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-400">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Phone / WhatsApp Number
                        </label>
                        <div className="relative">
                            <HiOutlinePhone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="+62 812 3456 7890"
                                className="w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-400">{errors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                            Location / Address
                        </label>
                        <div className="relative">
                            <HiOutlineMapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                            <textarea
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                placeholder="Jakarta, Indonesia"
                                className="w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                            />
                        </div>
                        {errors.address && (
                            <p className="text-xs text-red-400">{errors.address}</p>
                        )}
                    </div>

                    <div className="pt-1 sm:pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? "Saving..." : "Save Contact Info"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

