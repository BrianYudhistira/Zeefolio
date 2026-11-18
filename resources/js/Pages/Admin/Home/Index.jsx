import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import HeroContentForm from "@/Components/Admin/Home/HeroContentForm";
import QuickBioSidebar from "@/Components/Admin/Home/QuickBioSidebar";
import PortfolioStatusCapsule from "@/Components/Admin/PortfolioStatusCapsule";
import { notifyAdmin } from "@/Utils/notify";

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
        <PortfolioStatusCapsule isActive={data.is_active} slug={liveSlug} />
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
