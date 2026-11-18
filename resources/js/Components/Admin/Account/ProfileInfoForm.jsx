import {
    HiOutlineUserCircle,
    HiOutlineCamera,
    HiOutlineTrash,
    HiOutlineCheckBadge,
    HiOutlineExclamationTriangle,
    HiOutlineEnvelope,
} from "react-icons/hi2";

export default function ProfileInfoForm({
    profileForm,
    photoPreview,
    isVerified,
    sendingVerification,
    onPhotoChange,
    onRemovePhoto,
    onSendVerification,
    onSubmit,
}) {
    return (
        <form
            onSubmit={onSubmit}
            className="admin-card rounded-xl border p-4 sm:p-6 space-y-4 sm:space-y-5"
        >
            <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                    Profile Information
                </h2>
                <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                    Update your account photo, display name, username, and email address.
                </p>
            </div>

            {/* Profile Photo Picker */}
            <div className="flex items-center gap-3.5 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                    {photoPreview ? (
                        <img
                            src={photoPreview}
                            alt={profileForm.data.name || "Avatar"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <HiOutlineUserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" />
                    )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium cursor-pointer transition-colors">
                            <HiOutlineCamera className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={onPhotoChange}
                                className="hidden"
                            />
                        </label>

                        {photoPreview && (
                            <button
                                type="button"
                                onClick={onRemovePhoto}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/30 text-xs font-medium cursor-pointer transition-colors"
                            >
                                <HiOutlineTrash className="w-3.5 h-3.5" />
                                <span>Remove</span>
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                        JPG, PNG, or WEBP. Max 2MB.
                    </p>
                    {profileForm.errors.photo && (
                        <p className="text-xs text-red-400">
                            {profileForm.errors.photo}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Full Name
                    </label>
                    <input
                        type="text"
                        required
                        value={profileForm.data.name}
                        onChange={(e) =>
                            profileForm.setData("name", e.target.value)
                        }
                        className="w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none transition-colors"
                    />
                    {profileForm.errors.name && (
                        <p className="text-xs text-red-400">
                            {profileForm.errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                        Username
                    </label>
                    <input
                        type="text"
                        required
                        value={profileForm.data.username}
                        onChange={(e) =>
                            profileForm.setData("username", e.target.value)
                        }
                        className="w-full text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none transition-colors"
                    />
                    {profileForm.errors.username && (
                        <p className="text-xs text-red-400">
                            {profileForm.errors.username}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-medium text-zinc-300">
                        Email Address
                    </label>
                    {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
                            <HiOutlineCheckBadge className="w-3.5 h-3.5" />
                            <span>Verified</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-medium text-amber-300">
                            <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                            <span>Unverified</span>
                        </span>
                    )}
                </div>

                <div className="relative">
                    <HiOutlineEnvelope className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        required
                        value={profileForm.data.email}
                        onChange={(e) =>
                            profileForm.setData("email", e.target.value)
                        }
                        className="w-full text-sm pl-10 pr-3.5 py-2 sm:py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 outline-none transition-colors"
                    />
                </div>
                {profileForm.errors.email && (
                    <p className="text-xs text-red-400">
                        {profileForm.errors.email}
                    </p>
                )}

                {!isVerified && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <p className="text-xs text-amber-200/90 leading-relaxed">
                            Your email address is not verified yet. Verify it to secure your account.
                        </p>
                        <button
                            type="button"
                            disabled={sendingVerification}
                            onClick={onSendVerification}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                            {sendingVerification
                                ? "Sending..."
                                : "Send Verification Email"}
                        </button>
                    </div>
                )}
            </div>

            <div className="pt-1 flex justify-end">
                <button
                    type="submit"
                    disabled={profileForm.processing}
                    className="admin-btn-primary w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {profileForm.processing ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </form>
    );
}
