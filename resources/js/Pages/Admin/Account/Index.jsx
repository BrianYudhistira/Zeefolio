import { useEffect, useRef, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ProfileInfoForm from "@/Components/Admin/Account/ProfileInfoForm";
import UpdatePasswordForm from "@/Components/Admin/Account/UpdatePasswordForm";
import DeleteAccountSection from "@/Components/Admin/Account/DeleteAccountSection";

export default function AccountIndex({ account = {} }) {
    const [photoPreview, setPhotoPreview] = useState(account?.photo_url || null);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const photoBlobRef = useRef(null);

    useEffect(() => {
        return () => {
            if (photoBlobRef.current) {
                URL.revokeObjectURL(photoBlobRef.current);
            }
        };
    }, []);

    const profileForm = useForm({
        name: account?.name || "",
        username: account?.username || "",
        email: account?.email || "",
        photo: null,
        remove_photo: false,
    });

    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const deleteForm = useForm({
        password: "",
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (photoBlobRef.current) {
            URL.revokeObjectURL(photoBlobRef.current);
            photoBlobRef.current = null;
        }
        if (!file) return;

        const blobUrl = URL.createObjectURL(file);
        photoBlobRef.current = blobUrl;
        profileForm.setData((prev) => ({
            ...prev,
            photo: file,
            remove_photo: false,
        }));
        setPhotoPreview(blobUrl);
    };

    const handleRemovePhoto = () => {
        if (photoBlobRef.current) {
            URL.revokeObjectURL(photoBlobRef.current);
            photoBlobRef.current = null;
        }
        profileForm.setData((prev) => ({
            ...prev,
            photo: null,
            remove_photo: true,
        }));
        setPhotoPreview(null);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.post(route("admin.account.profile"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                profileForm.setData("photo", null);
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put(route("admin.account.password"), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const handleSendVerification = () => {
        setSendingVerification(true);
        router.post(
            route("admin.account.verification.send"),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSendingVerification(false),
            }
        );
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete(route("admin.account.destroy"), {
            preserveScroll: true,
        });
    };

    const isVerified = Boolean(account?.email_verified_at);

    return (
        <>
            <Head title="Account Settings" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                <div className="lg:col-span-7">
                    <ProfileInfoForm
                        profileForm={profileForm}
                        photoPreview={photoPreview}
                        isVerified={isVerified}
                        sendingVerification={sendingVerification}
                        onPhotoChange={handlePhotoChange}
                        onRemovePhoto={handleRemovePhoto}
                        onSendVerification={handleSendVerification}
                        onSubmit={handleProfileSubmit}
                    />
                </div>

                <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                    <UpdatePasswordForm
                        passwordForm={passwordForm}
                        onSubmit={handlePasswordSubmit}
                    />

                    <DeleteAccountSection
                        deleteForm={deleteForm}
                        deleteModalOpen={deleteModalOpen}
                        onOpenModal={() => {
                            deleteForm.reset();
                            deleteForm.clearErrors();
                            setDeleteModalOpen(true);
                        }}
                        onCloseModal={() => setDeleteModalOpen(false)}
                        onSubmit={handleDeleteAccount}
                    />
                </div>
            </div>
        </>
    );
}

AccountIndex.layout = (page) => (
    <AdminLayout title="Account Settings">{page}</AdminLayout>
);
