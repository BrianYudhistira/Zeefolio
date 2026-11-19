import { useMemo, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import MobileFab from "@/Components/Admin/MobileFab";
import { HiOutlinePlus } from "react-icons/hi2";
import EmptyState from "@/Components/UI/EmptyState";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import ExperienceCardItem from "@/Components/Admin/Experiences/ExperienceCardItem";
import ExperienceFormModal from "@/Components/Admin/Experiences/ExperienceFormModal";
import {
    formatDateInput,
    parseSkillNames,
} from "@/Components/Admin/Experiences/ExperienceCardItem";

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
            },
        });
    };

    const confirmDelete = () => {
        if (!expToDelete) return;
        setDeleting(true);
        router.delete(route("admin.experiences.destroy", expToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setExpToDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title="Experiences" />

            <div className="space-y-3.5 pb-20 sm:pb-0">
                <div className="flex items-center justify-between gap-2 px-0.5">
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--text)]">
                            Experiences ({experiences.length})
                        </h2>
                        <p className="hidden sm:block text-xs text-[var(--text-muted)] mt-0.5">
                            Sorted automatically from newest to oldest.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="admin-btn-primary admin-btn-sm hidden sm:inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                        <HiOutlinePlus className="w-4 h-4 shrink-0" />
                        <span>Add Experience</span>
                    </button>
                </div>

                {experiences.length === 0 ? (
                    <div className="admin-card rounded-xl border overflow-hidden">
                        <EmptyState
                            message="No experiences added yet."
                            actionLabel="Add Experience"
                            onAction={openCreate}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
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

            <MobileFab onClick={openCreate} label="Add Experience" />

            <ExperienceFormModal
                open={modalOpen}
                editingItem={editingItem}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                skills={skills}
                onToggleSkill={toggleSkill}
                onClose={() => !processing && setModalOpen(false)}
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
        </>
    );
}

ExperiencesIndex.layout = (page) => (
    <AdminLayout title="Experiences">{page}</AdminLayout>
);
