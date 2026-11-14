import { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePlus, HiOutlineCog6Tooth } from "react-icons/hi2";
import { notifyAdmin } from "@/Utils/notify";
import SearchInput from "@/Components/UI/SearchInput";
import ConfirmDeleteModal from "@/Components/UI/ConfirmDeleteModal";
import TechStackCardItem from "@/Components/Admin/TechStacks/TechStackCardItem";
import TechStackFormModal from "@/Components/Admin/TechStacks/TechStackFormModal";

export default function TechStacksIndex({
    techStacks = [],
    categories = [],
    isAdmin = false,
}) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [scopeFilter, setScopeFilter] = useState("all");
    const [editingItem, setEditingItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({ name: "", icon: "", category_id: "" });

    const filteredStacks = techStacks.filter((ts) => {
        if (scopeFilter === "global" && !ts.is_global) return false;
        if (scopeFilter === "custom" && ts.is_global) return false;
        if (selectedCategory !== "all" && String(ts.category_id) !== String(selectedCategory)) return false;
        const q = search.toLowerCase();
        return (
            ts.name?.toLowerCase().includes(q) ||
            ts.icon?.toLowerCase().includes(q) ||
            ts.category?.name?.toLowerCase().includes(q)
        );
    });

    const globalCount = techStacks.filter((t) => t.is_global).length;
    const customCount = techStacks.filter((t) => !t.is_global).length;

    const openCreate = () => {
        setEditingItem(null);
        clearErrors();
        setData({ name: "", icon: "", category_id: selectedCategory !== "all" ? String(selectedCategory) : "" });
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        clearErrors();
        setData({ name: item.name || "", icon: item.icon || "", category_id: item.category_id || "" });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const skillName = data.name.trim();
        const action = editingItem
            ? (cb) => put(route("admin.tech-stacks.update", editingItem.id), cb)
            : (cb) => post(route("admin.tech-stacks.store"), cb);

        action({
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
                notifyAdmin({
                    type: "success",
                    title: editingItem ? "Custom Skill Updated" : "Custom Skill Added",
                    message: `Custom skill "${skillName}" has been ${editingItem ? "updated" : "added"}.`,
                });
            },
        });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const skillName = itemToDelete.name;
        setDeleting(true);
        router.delete(route("admin.tech-stacks.destroy", itemToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setItemToDelete(null);
                setDeleting(false);
                notifyAdmin({
                    type: "success",
                    title: "Deleted",
                    message: `Custom skill "${skillName}" has been deleted.`,
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    const scopeTabs = [
        { id: "all", label: "All Available", short: `All (${techStacks.length})`, count: techStacks.length },
        { id: "custom", label: "My Custom Skills", short: `Custom (${customCount})`, count: customCount },
        { id: "global", label: "Global Default (Read-only)", short: `Global (${globalCount})`, count: globalCount },
    ];

    return (
        <AdminLayout
            title="Tech Stacks"
            headerActions={
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Link
                            href={route("admin.settings.index")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-xs transition-colors"
                        >
                            <HiOutlineCog6Tooth className="w-4 h-4" />
                            <span className="hidden sm:inline">Global Settings</span>
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span className="sm:hidden">New</span>
                        <span className="hidden sm:inline">New Custom Skill</span>
                    </button>
                </div>
            }
        >
            <Head title="Tech Stacks - Zeefolio" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                <div className="lg:hidden rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 space-y-2.5">
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                        {scopeTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setScopeFilter(tab.id)}
                                className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors cursor-pointer truncate ${
                                    scopeFilter === tab.id
                                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                        : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                                }`}
                            >
                                {tab.short}
                            </button>
                        ))}
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        aria-label="Filter by category"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-600 focus:ring-0 outline-none"
                    >
                        <option value="all">All Categories ({techStacks.length})</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>
                                {cat.name} ({cat.tech_stacks_count ?? 0})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="hidden lg:block lg:col-span-4 space-y-5">
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-100">Skill Catalog</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Manage your own custom skills or browse the global skill catalog.
                            </p>
                        </div>
                        <div className="space-y-1">
                            {scopeTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setScopeFilter(tab.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                        scopeFilter === tab.id
                                            ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="text-zinc-500">{tab.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-100">Filter by Category</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Select a category to filter the skills list.</p>
                        </div>
                        <div className="space-y-1 pt-1">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("all")}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                    selectedCategory === "all"
                                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                                }`}
                            >
                                <span>All Categories</span>
                                <span className="text-zinc-500">{techStacks.length}</span>
                            </button>
                            {categories.map((cat) => {
                                const isSelected = String(selectedCategory) === String(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(isSelected ? "all" : String(cat.id))}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                                            isSelected
                                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-zinc-500">{cat.tech_stacks_count ?? 0}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {isAdmin && (
                            <div className="pt-2 border-t border-zinc-800">
                                <Link
                                    href={route("admin.settings.index")}
                                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                                >
                                    <HiOutlineCog6Tooth className="w-3.5 h-3.5" />
                                    <span>Manage Global Skills & Categories in Settings →</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-zinc-100">
                                    Technologies ({filteredStacks.length})
                                </h2>
                                {(selectedCategory !== "all" || scopeFilter !== "all") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setScopeFilter("all");
                                        }}
                                        className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                            <SearchInput value={search} onChange={setSearch} placeholder="Search tech stacks..." />
                        </div>

                        {filteredStacks.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-12 text-center">No tech stacks found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-800">
                                {filteredStacks.map((ts) => (
                                    <TechStackCardItem key={ts.id} item={ts} onEdit={openEdit} onDelete={setItemToDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TechStackFormModal
                open={modalOpen}
                editingItem={editingItem}
                categories={categories}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <ConfirmDeleteModal
                open={Boolean(itemToDelete)}
                title="Delete Custom Skill"
                itemName={itemToDelete?.name}
                processing={deleting}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
            />
        </AdminLayout>
    );
}
