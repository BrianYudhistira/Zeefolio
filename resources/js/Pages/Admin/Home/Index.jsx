import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import HeroContentForm from "@/Components/Admin/Home/HeroContentForm";
import QuickBioSidebar from "@/Components/Admin/Home/QuickBioSidebar";
import { notifyAdmin } from "@/Utils/notify";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

export default function HomeIndex({ home = {}, portfolioMeta = {} }) {
    const [passionInput, setPassionInput] = useState("");
    const [imagePreview, setImagePreview] = useState(home?.image_url || null);

    const socialLinks = home?.social_media_links || {};

    const { data, setData, post, processing, errors } = useForm({
        greeting: home?.greeting || "Hello, I am",
        name: home?.name || "",
        slug: portfolioMeta?.slug || "",
        passions: Array.isArray(home?.passions) ? home.passions : [],
        description: home?.description || "",
        social_media_links: {
            github: socialLinks.github || "",
            linkedin: socialLinks.linkedin || "",
            instagram: socialLinks.instagram || "",
            website: socialLinks.website || "",
        },
        is_active: portfolioMeta?.is_active ?? true,
        image: null,
        cv: null,
    });

    const addPassion = () => {
        const trimmed = passionInput.trim();
        if (!trimmed || data.passions.includes(trimmed)) return;
        setData("passions", [...data.passions, trimmed]);
        setPassionInput("");
    };

    const removePassion = (item) => {
        setData(
            "passions",
            data.passions.filter((p) => p !== item)
        );
    };

    const handlePassionKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addPassion();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setData("image", file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.home.update"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                notifyAdmin({
                    type: "success",
                    title: "Home Updated",
                    message: "Home & profile settings have been saved.",
                });
            },
        });
    };

    const liveSlug = data.slug || portfolioMeta?.slug;

    const headerActions = (
        <>
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] sm:text-xs text-zinc-300">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        data.is_active ? "bg-emerald-400" : "bg-zinc-500"
                    }`}
                />
                {data.is_active ? "Active" : "Draft"}
            </span>

            {liveSlug && (
                <Link
                    href={route("portfolio.index", { slug: liveSlug })}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors"
                >
                    <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
                    <span className="sm:hidden">Live</span>
                    <span className="hidden sm:inline">Live Site</span>
                </Link>
            )}
        </>
    );

    return (
        <AdminLayout title="Home & Profile" headerActions={headerActions}>
            <Head title="Home & Profile - Zeefolio" />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    <HeroContentForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        passionInput={passionInput}
                        setPassionInput={setPassionInput}
                        onAddPassion={addPassion}
                        onRemovePassion={removePassion}
                        onPassionKeyDown={handlePassionKeyDown}
                    />

                    <QuickBioSidebar
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        imagePreview={imagePreview}
                        cvUrl={home?.cv_url}
                        onImageChange={handleImageChange}
                    />
                </div>
            </form>
        </AdminLayout>
    );
}
