import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { DashboardStatsCards } from '@/components/dashboard-stats-cards'
import { DashboardRecentPackages } from '@/components/dashboard-recent-packages'
import { DashboardPackageStatusChart } from '@/components/dashboard-package-status-chart'
import { DashboardTopPerformers } from '@/components/dashboard-top-performers'
import {
  useDashboardStats,
  useRecentPackages,
  useTopMerchants,
  useTopDrivers,
  usePackageStatusDistribution,
} from '@/hooks/useDashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentPackages, isLoading: packagesLoading } =
    useRecentPackages(10)
  const { data: topMerchants, isLoading: merchantsLoading } =
    useTopMerchants(5)
  const { data: topDrivers, isLoading: driversLoading } = useTopDrivers(5)
  const { data: statusDistribution, isLoading: distributionLoading } =
    usePackageStatusDistribution()

  const isLoading =
    statsLoading ||
    packagesLoading ||
    merchantsLoading ||
    driversLoading ||
    distributionLoading

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome to the DYHE Platform Dashboard
          </p>
        </div>

        {/* Loading State */}
        {isLoading && !stats && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <div className="mt-4 text-gray-600">
              Loading dashboard data...
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {stats && (
          <>
            {/* Stats Cards */}
            <DashboardStatsCards stats={stats} loading={statsLoading} />

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DashboardRecentPackages
                  packages={recentPackages || []}
                  loading={packagesLoading}
                />
              </div>
              <div>
                <DashboardPackageStatusChart
                  distribution={statusDistribution || []}
                  loading={distributionLoading}
                />
              </div>
            </div>

            {/* Top Performers */}
            <DashboardTopPerformers
              merchants={topMerchants || []}
              drivers={topDrivers || []}
              loading={merchantsLoading || driversLoading}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}
