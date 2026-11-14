import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePlus } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import EmptyState from "@/Components/UI/EmptyState";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import ExperienceCardItem, {
    formatDateInput,
} from "@/Components/Admin/Experiences/ExperienceCardItem";
import ExperienceFormModal from "@/Components/Admin/Experiences/ExperienceFormModal";

export default function ExperiencesIndex({ experiences = [] }) {
    const [editingItem, setEditingItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [movingId, setMovingId] = useState(null);
    const [expToDelete, setExpToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            tech_stack: "",
            sort_order: 0,
        });

    const openCreate = () => {
        setEditingItem(null);
        clearErrors();
        setData({
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            tech_stack: "",
            sort_order: experiences.length,
        });
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            company: item.company || "",
            position: item.position || "",
            start_date: formatDateInput(item.start_date),
            end_date: formatDateInput(item.end_date),
            description: item.description || "",
            tech_stack: item.tech_stack || "",
            sort_order: item.sort_order ?? 0,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const roleLabel = `${data.position.trim()} @ ${data.company.trim()}`;
        if (editingItem) {
            put(route("admin.experiences.update", editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                    notifyAdmin({
                        type: "success",
                        title: "Experience Updated",
                        message: `Experience "${roleLabel}" has been updated.`,
                    });
                },
            });
        } else {
            post(route("admin.experiences.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                    notifyAdmin({
                        type: "success",
                        title: "Experience Added",
                        message: `Experience "${roleLabel}" has been added.`,
                    });
                },
            });
        }
    };

    const handleMove = (exp, direction) => {
        setMovingId(exp.id);
        router.put(
            route("admin.experiences.move", exp.id),
            { direction },
            {
                preserveScroll: true,
                onFinish: () => setMovingId(null),
            }
        );
    };

    const confirmDelete = () => {
        if (!expToDelete) return;
        const roleLabel = `${expToDelete.position} @ ${expToDelete.company}`;
        setDeleting(true);
        router.delete(route("admin.experiences.destroy", expToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setExpToDelete(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: `Experience "${roleLabel}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AdminLayout
            title="Experiences"
            headerActions={
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors cursor-pointer"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add Experience</span>
                </button>
            }
        >
            <Head title="Experiences - Zeefolio" />

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Career Timeline ({experiences.length})
                        </h2>
                        <p className="hidden sm:block text-xs text-zinc-500 mt-0.5">
                            Use the arrow buttons to adjust the display order on your portfolio.
                        </p>
                    </div>
                </div>

                {experiences.length === 0 ? (
                    <EmptyState
                        message="No work experiences added yet."
                        actionLabel="Add First Experience"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {experiences.map((exp, idx) => (
                            <ExperienceCardItem
                                key={exp.id}
                                exp={exp}
                                idx={idx}
                                totalCount={experiences.length}
                                movingId={movingId}
                                onMove={handleMove}
                                onEdit={openEdit}
                                onDelete={setExpToDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ExperienceFormModal
                open={modalOpen}
                editingItem={editingItem}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <ConfirmDeleteModal
                open={Boolean(expToDelete)}
                title="Delete Experience"
                itemName={
                    expToDelete
                        ? `${expToDelete.position} @ ${expToDelete.company}`
                        : ""
                }
                confirmLabel="Delete Experience"
                processing={deleting}
                onClose={() => setExpToDelete(null)}
                onConfirm={confirmDelete}
            />
        </AdminLayout>
    );
}
