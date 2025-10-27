import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackageStatusDistribution } from "@/lib/api/dashboard";

interface PackageStatusChartProps {
  distribution: PackageStatusDistribution[];
  loading?: boolean;
}

export function DashboardPackageStatusChart({ distribution, loading = false }: PackageStatusChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-500";
      case "IN_TRANSIT":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      case "RETURNED":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "Delivered";
      case "IN_TRANSIT":
        return "In Transit";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "RETURNED":
        return "Returned";
      default:
        return status;
    }
  };

  const totalPackages = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : distribution.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No package data available
          </div>
        ) : (
          <div className="space-y-4">
            {distribution.map((item, index) => {
              const percentage =
                totalPackages > 0 ? (item.count / totalPackages) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{getStatusLabel(item.status)}</span>
                    <span className="text-sm text-gray-500">
                      {item.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStatusColor(item.status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
