import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ProfileInfoForm from "@/Components/Admin/Account/ProfileInfoForm";
import UpdatePasswordForm from "@/Components/Admin/Account/UpdatePasswordForm";
import DeleteAccountSection from "@/Components/Admin/Account/DeleteAccountSection";
import { notifyAdmin } from "@/Utils/notify";

export default function AccountIndex({ account = {} }) {
    const [photoPreview, setPhotoPreview] = useState(account?.photo_url || null);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
        if (!file) return;
        profileForm.setData((prev) => ({
            ...prev,
            photo: file,
            remove_photo: false,
        }));
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
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
                notifyAdmin({
                    type: "success",
                    title: "Profile Updated",
                    message: "Your profile information has been saved.",
                });
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put(route("admin.account.password"), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                notifyAdmin({
                    type: "success",
                    title: "Password Updated",
                    message: "Your account password has been updated.",
                });
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
                onSuccess: () => {
                    notifyAdmin({
                        type: "success",
                        title: "Verification Sent",
                        message: "Verification email has been sent.",
                    });
                },
                onFinish: () => setSendingVerification(false),
            }
        );
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete(route("admin.account.destroy"), {
            preserveScroll: true,
            onError: () => {
                // Keep modal open to show validation error
            },
        });
    };

    const isVerified = Boolean(account?.email_verified_at);

    return (
        <AdminLayout title="Account Settings">
            <Head title="Account Settings - Zeefolio" />

            <div className="max-w-3xl space-y-4 sm:space-y-6">
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
        </AdminLayout>
    );
}
