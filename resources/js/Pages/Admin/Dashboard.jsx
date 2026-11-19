import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ViewsChart from "@/Components/ViewsChart";
import DashboardStatsGrid from "@/Components/Admin/Dashboard/DashboardStatsGrid";
import RecentProjectsCard from "@/Components/Admin/Dashboard/RecentProjectsCard";
import ProfileSummaryCard from "@/Components/Admin/Dashboard/ProfileSummaryCard";

export default function Dashboard({
    stats = {},
    viewAnalytics = {},
    portfolioSummary = {},
    recentProjects = [],
    recentLogs = [],
}) {
    const { auth } = usePage().props;
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
                replace: true,
                only: ["viewAnalytics"],
                onStart: () => setLoadingRange(true),
                onFinish: () => setLoadingRange(false),
            }
        );
    };

    const portfolioSlug =
        portfolioSummary?.slug ||
        auth?.user?.portfolio_slug ||
        auth?.user?.username ||
        null;

    return (
        <>
            <Head title="Dashboard" />

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
                    <ProfileSummaryCard recentLogs={recentLogs} />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;
