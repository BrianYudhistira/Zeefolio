import { useMemo, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePlus } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import EmptyState from "@/Components/UI/EmptyState";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import ExperienceCardItem, {
    formatDateInput,
    parseSkillNames,
} from "@/Components/Admin/Experiences/ExperienceCardItem";
import ExperienceFormModal from "@/Components/Admin/Experiences/ExperienceFormModal";

export default function ExperiencesIndex({ experiences = [], skills = [] }) {
    const [editingItem, setEditingItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [expToDelete, setExpToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            skill_ids: [],
        });

    const { skillIdByName, skillIconByName } = useMemo(() => {
        const idMap = new Map();
        const iconMap = new Map();

        skills.forEach((skill) => {
            const key = skill.name.trim().toLowerCase();
            idMap.set(key, skill.id);
            iconMap.set(key, skill.icon);
        });

        return { skillIdByName: idMap, skillIconByName: iconMap };
    }, [skills]);

    const resolveSkillIdsFromExperience = (rawSkills) => {
        const matchedIds = [];
        parseSkillNames(rawSkills).forEach((name) => {
            const id = skillIdByName.get(name.toLowerCase());
            if (id && !matchedIds.includes(id)) {
                matchedIds.push(id);
            }
        });
        return matchedIds;
    };

    const toggleSkill = (skillId) => {
        setData(
            "skill_ids",
            data.skill_ids.includes(skillId)
                ? data.skill_ids.filter((id) => id !== skillId)
                : [...data.skill_ids, skillId]
        );
    };

    const openCreate = () => {
        setEditingItem(null);
        clearErrors();
        setData({
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            skill_ids: [],
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
            skill_ids: resolveSkillIdsFromExperience(item.tech_stack),
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const roleLabel = `${data.position.trim()} @ ${data.company.trim()}`;
        const isEditing = Boolean(editingItem);
        const targetUrl = isEditing
            ? route("admin.experiences.update", editingItem.id)
            : route("admin.experiences.store");
        const submit = isEditing ? put : post;

        submit(targetUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
                notifyAdmin({
                    type: "success",
                    title: isEditing ? "Experience Updated" : "Experience Added",
                    message: `Experience "${roleLabel}" has been ${isEditing ? "updated" : "added"}.`,
                });
            },
        });
    };

    const confirmDelete = () => {
        if (!expToDelete) return;
        const roleLabel = `${expToDelete.position} @ ${expToDelete.company}`;
        setDeleting(true);
        router.delete(route("admin.experiences.destroy", expToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setExpToDelete(null);
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
                    className="admin-btn-primary inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add Experience</span>
                </button>
            }
        >
            <Head title="Experiences - Zeefolio" />

            <div className="admin-card rounded-xl border overflow-hidden">
                <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Experiences ({experiences.length})
                        </h2>
                        <p className="hidden sm:block text-xs text-zinc-500 mt-0.5">
                            Sorted automatically from newest to oldest.
                        </p>
                    </div>
                </div>

                {experiences.length === 0 ? (
                    <EmptyState
                        message="No experiences added yet."
                        actionLabel="Add First Experience"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {experiences.map((exp, idx) => (
                            <ExperienceCardItem
                                key={exp.id}
                                exp={exp}
                                skillIconByName={skillIconByName}
                                idx={idx}
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
                skills={skills}
                onToggleSkill={toggleSkill}
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
