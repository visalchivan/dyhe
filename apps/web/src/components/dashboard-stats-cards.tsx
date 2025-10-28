import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Inbox,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface DashboardStats {
  totalReceived: number;
  totalDelivered: number;
  totalPending: number;
  onDelivery: number;
  totalFailed: number;
  totalReturned: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function DashboardStatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 rounded w-20 mb-2"></div>
              <div className="h-8 rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Received",
      value: stats.totalReceived,
      description: "Packages received",
      icon: <Inbox className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Delivered",
      value: stats.totalDelivered,
      description: "Successfully delivered",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Pending",
      value: stats.totalPending,
      description: "Awaiting pickup",
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "On Delivery",
      value: stats.onDelivery,
      description: "Currently in transit",
      icon: <Truck className="h-5 w-5 text-purple-500" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Failed",
      value: stats.totalFailed,
      description: "Failed deliveries",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Returned",
      value: stats.totalReturned,
      description: "Returned packages",
      icon: <RotateCcw className="h-5 w-5 text-orange-500" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-2 border-transparent hover:border-gray-200 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              {stat.icon}
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </p>
            <CardDescription className="text-xs">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
