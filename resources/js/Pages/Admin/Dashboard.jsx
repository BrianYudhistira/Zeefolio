import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ViewsChart from "@/Components/ViewsChart";
import DashboardStatsGrid from "@/Components/Admin/Dashboard/DashboardStatsGrid";
import RecentProjectsCard from "@/Components/Admin/Dashboard/RecentProjectsCard";
import ProfileSummaryCard from "@/Components/Admin/Dashboard/ProfileSummaryCard";
import PortfolioStatusCapsule from "@/Components/Admin/PortfolioStatusCapsule";

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
        <PortfolioStatusCapsule
            isActive={portfolioSummary.is_active}
            slug={portfolioSlug}
        />
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
