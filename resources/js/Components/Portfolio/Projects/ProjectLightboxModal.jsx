import { HiXMark } from "react-icons/hi2";

export default function ProjectLightboxModal({ image, onClose }) {
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors"
                aria-label="Close image preview"
            >
                <HiXMark className="w-6 h-6" />
            </button>
            <img
                src={image}
                alt="Full preview"
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
