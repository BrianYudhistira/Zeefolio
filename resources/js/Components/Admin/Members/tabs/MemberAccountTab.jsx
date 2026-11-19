import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";
import { formatDateShort, formatDateTime } from "@/Utils/dateHelpers";

export default function MemberAccountTab({
    selectedMember,
    roleCfg,
    statusCfg,
    onEditAccount,
    onDeleteAccount,
}) {
    return (
        <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 sm:p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <p className="text-[11px] text-zinc-500">Assigned Role</p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-zinc-100">
                            {roleCfg.label}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                            {selectedMember.role}
                        </span>
                    </div>
                    <p className="hidden sm:block text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                        {roleCfg.description}
                    </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex sm:block items-center justify-between">
                        <p className="text-[11px] text-zinc-500">
                            Account Status
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-100 sm:mt-0.5 capitalize">
                            {statusCfg.label}
                        </p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Portfolio Status</span>
                        <span className="text-zinc-300">
                            {selectedMember.portfolio?.is_active
                                ? "Active"
                                : selectedMember.has_portfolio
                                  ? "Draft"
                                  : "Uninitialized"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Joined</span>
                        <span className="text-zinc-300 tabular-nums">
                            {formatDateShort(selectedMember.created_at, "—")}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Last Login</span>
                        <span className="text-zinc-300 font-mono text-[11px] tabular-nums">
                            {formatDateTime(
                                selectedMember.last_login_at,
                                "Never"
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">IP / Location</span>
                        <span className="text-zinc-300 font-mono text-[11px]">
                            {selectedMember.ip_address || "—"}
                            {selectedMember.location
                                ? ` (${selectedMember.location})`
                                : ""}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account Actions Box */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-zinc-200">
                        Account & Role Actions
                    </p>
                    <p className="hidden sm:block text-xs text-zinc-500 mt-0.5">
                        {selectedMember.can_edit
                            ? "Update profile credentials, reset password, change role, or suspend access."
                            : "You have read-only access to this higher-privilege account."}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {selectedMember.can_edit && (
                        <button
                            type="button"
                            onClick={() => onEditAccount(selectedMember)}
                            className="admin-btn-secondary admin-btn-md flex-1 sm:flex-initial inline-flex items-center justify-center font-medium transition-colors cursor-pointer"
                        >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                            <span>Edit Account</span>
                        </button>
                    )}

                    {selectedMember.can_delete && (
                        <button
                            type="button"
                            onClick={() => onDeleteAccount(selectedMember)}
                            title="Delete account"
                            aria-label="Delete account"
                            className="admin-btn-danger admin-btn-md admin-btn-mobile-icon inline-flex items-center justify-center font-medium transition-colors cursor-pointer"
                        >
                            <HiOutlineTrash className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
