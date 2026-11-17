import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ViewsChart from "@/Components/ViewsChart";
import DashboardStatsGrid from "@/Components/Admin/Dashboard/DashboardStatsGrid";
import RecentProjectsCard from "@/Components/Admin/Dashboard/RecentProjectsCard";
import ProfileSummaryCard from "@/Components/Admin/Dashboard/ProfileSummaryCard";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

export default function Dashboard({
    stats = {},
    viewAnalytics = {},
    portfolioSummary = {},
    recentProjects = [],
    recentLogs = [],
}) {
    const [loadingRange, setLoadingRange] = useState(false);

    const handleRangeChange = (nextRange) => {
        if (nextRange === viewAnalytics.range) return;
        router.get(
            route("admin.dashboard"),
            { range: nextRange },
            {
                showProgress: false,
                preserveState: true,
                preserveScroll: true,
                only: ["viewAnalytics", "stats"],
                onStart: () => setLoadingRange(true),
                onFinish: () => setLoadingRange(false),
            },
        );
    };

    const portfolioSlug = portfolioSummary?.slug || "brian-yudhistira";

    const headerActions = (
        <>
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] sm:text-xs text-zinc-300">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${portfolioSummary.is_active
                        ? "bg-emerald-400"
                        : "bg-zinc-500"
                        }`}
                />
                {portfolioSummary.is_active ? "Active" : "Draft"}
            </span>

            <a
                href={route("portfolio.index", { slug: portfolioSlug })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium text-xs transition-colors"
            >
                <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
                <span className="sm:hidden">Live</span>
                <span className="hidden sm:inline">Live Site</span>
            </a>
        </>
    );

    return (
        <AdminLayout title="Dashboard" headerActions={headerActions}>
            <Head title="Dashboard - Zeefolio" />

            <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <DashboardStatsGrid stats={stats} />

                {/* Portfolio Views Graph */}
                <ViewsChart
                    analytics={viewAnalytics}
                    onRangeChange={handleRangeChange}
                    isLoading={loadingRange}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                    <RecentProjectsCard
                        recentProjects={recentProjects}
                        portfolioSlug={portfolioSlug}
                    />
                    <ProfileSummaryCard
                        recentLogs={recentLogs}
                        portfolioSummary={portfolioSummary}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
