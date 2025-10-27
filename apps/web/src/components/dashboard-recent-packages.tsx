import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RecentPackage } from "@/lib/api/dashboard";

interface RecentPackagesProps {
  packages: RecentPackage[];
  loading?: boolean;
}

export function DashboardRecentPackages({ packages, loading = false }: RecentPackagesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "IN_TRANSIT":
        return "default";
      case "PENDING":
        return "outline";
      case "FAILED":
        return "destructive";
      case "RETURNED":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Packages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No recent packages found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono text-sm">
                      {pkg.packageNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.merchant.name}</div>
                        <div className="text-sm text-gray-500">{pkg.merchant.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.driver ? (
                        <div>
                          <div className="font-medium">{pkg.driver.name}</div>
                          <div className="text-sm text-gray-500">{pkg.driver.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(pkg.status) as any}>
                        {pkg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
