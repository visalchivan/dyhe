import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Store, User } from "lucide-react";
import type { TopMerchant, TopDriver } from "@/lib/api/dashboard";

interface TopPerformersProps {
  merchants: TopMerchant[];
  drivers: TopDriver[];
  loading?: boolean;
}

export function DashboardTopPerformers({ merchants, drivers, loading = false }: TopPerformersProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Top Merchants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-500" />
            Top Merchants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : merchants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No merchant data available
            </div>
          ) : (
            <div className="space-y-3">
              {merchants.map((merchant, index) => (
                <div key={merchant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="bg-blue-500 text-white">
                    <AvatarFallback className="font-bold">{index + 1}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{merchant.name}</div>
                    <div className="text-sm text-gray-500 truncate">{merchant.email}</div>
                  </div>
                  <Badge variant="default" className="ml-auto">
                    {merchant._count.packages} packages
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            Top Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No driver data available
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver, index) => (
                <div key={driver.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="bg-green-500 text-white">
                    <AvatarFallback className="font-bold">{index + 1}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{driver.name}</div>
                    <div className="text-sm text-gray-500 truncate">{driver.email}</div>
                  </div>
                  <Badge variant="default" className="ml-auto">
                    {driver._count.packages} deliveries
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
