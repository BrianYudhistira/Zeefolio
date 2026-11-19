import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { HiXMark } from "react-icons/hi2";
import { useAdminTheme } from "@/Hooks/useAdminTheme";

export default function AdminModal({
    open,
    onClose,
    title,
    subtitle = null,
    maxWidthClass = "max-w-lg",
    role = "dialog",
    preventClose = false,
    showCloseButton = true,
    mobileSheet = false,
    children,
    panelClassName = "",
}) {
    const { theme } = useAdminTheme();

    const handleClose = () => {
        if (preventClose) return;
        onClose?.();
    };

    const containerAlign = mobileSheet
        ? "items-end sm:items-center p-0 sm:p-4"
        : "items-center p-3 sm:p-4";

    const panelRadius = mobileSheet
        ? "rounded-t-2xl sm:rounded-xl"
        : "rounded-xl";

    return (
        <Dialog
            open={Boolean(open)}
            onClose={handleClose}
            role={role}
            data-theme={theme}
            className="admin-theme relative z-50 font-sans"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-150 data-[closed]:opacity-0"
            />

            <div className={`fixed inset-0 overflow-y-auto`}>
                <div
                    className={`flex min-h-full justify-center ${containerAlign}`}
                >
                    <DialogPanel
                        transition
                        className={`w-full ${maxWidthClass} ${panelRadius} bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 data-[closed]:opacity-0 data-[closed]:scale-95 ${panelClassName}`}
                    >
                        {(title || showCloseButton) && (
                            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                                <div className="min-w-0">
                                    {title && (
                                        <DialogTitle
                                            as="h3"
                                            className="text-sm font-semibold text-zinc-100 truncate"
                                        >
                                            {title}
                                        </DialogTitle>
                                    )}
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>

                                {showCloseButton && (
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={preventClose}
                                        aria-label="Close modal"
                                        title="Close"
                                        className="admin-icon-btn inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]"
                                    >
                                        <HiXMark className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
