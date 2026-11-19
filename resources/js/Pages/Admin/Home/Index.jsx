import { useEffect, useRef, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import HeroContentForm from "@/Components/Admin/Home/HeroContentForm";
import QuickBioSidebar from "@/Components/Admin/Home/QuickBioSidebar";

export default function HomeIndex({ home = {}, portfolioMeta = {} }) {
    const [passionInput, setPassionInput] = useState("");
    const [imagePreview, setImagePreview] = useState(home?.image_url || null);
    const blobUrlRef = useRef(null);

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
        };
    }, []);

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
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
        if (file) {
            const url = URL.createObjectURL(file);
            blobUrlRef.current = url;
            setImagePreview(url);
        } else {
            setImagePreview(home?.image_url || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.home.update"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData((prev) => ({ ...prev, image: null, cv: null }));
            },
        });
    };

    return (
        <>
            <Head title="Home & Profile" />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto_1fr_auto] gap-4 sm:gap-6 items-start">
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
        </>
    );
}

HomeIndex.layout = (page) => (
    <AdminLayout title="Home & Profile">{page}</AdminLayout>
);
