import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  Search,
  RefreshCw,
  MoreVertical,
  Eye,
  Printer,
  PackagePlus,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePackages, useDeletePackage } from "@/hooks/usePackages";
import { useMerchants } from "@/hooks/useMerchants";
import { useDrivers } from "@/hooks/useDrivers";
import type { Package } from "@/lib/api/packages";

interface PackagesTableProps {
  onCreatePackage: () => void;
  onBulkCreatePackages: () => void;
  onEditPackage: (packageData: Package) => void;
  onViewPackage: (packageData: Package) => void;
}

export function PackagesTable({
  onEditPackage,
  onViewPackage,
}: PackagesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [merchantFilter, setMerchantFilter] = useState<string | undefined>(
    undefined
  );
  const [driverFilter, setDriverFilter] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, refetch } = usePackages({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
    merchantId: merchantFilter,
    driverId: driverFilter,
  });

  const { data: merchantsData } = useMerchants({ page: 1, limit: 1000 });
  const { data: driversData } = useDrivers({ page: 1, limit: 1000 });

  const deletePackageMutation = useDeletePackage();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackageMutation.mutateAsync(id);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "DELIVERING":
        return "default";
      case "PREPARING":
        return "outline";
      case "READY":
        return "default";
      case "RECEIVED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      case "RETURNED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const packages = data?.packages || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select
          value={merchantFilter}
          onValueChange={(value) => {
            setMerchantFilter(value === "all" ? undefined : value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            {merchantsData?.merchants.map((merchant) => (
              <SelectItem key={merchant.id} value={merchant.id}>
                {merchant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={driverFilter}
          onValueChange={(value) => {
            setDriverFilter(value === "all" ? undefined : value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {driversData?.drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Link to="/packages/bulk-create">
          <Button className="gap-2">
            <PackagePlus className="h-4 w-4" />
            Bulk Create
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>COD</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No packages found.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {pkg.packageNumber}
                  </TableCell>
                  <TableCell>{pkg.customerName}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {pkg.customerPhone}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {pkg.customerAddress}
                  </TableCell>
                  <TableCell>${Number(pkg.codAmount).toFixed(2)}</TableCell>
                  <TableCell>${Number(pkg.deliveryFee).toFixed(2)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.merchant.name}</div>
                      <div className="text-sm text-gray-500">
                        {pkg.merchant.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pkg.driver ? (
                      <div className="font-medium">{pkg.driver.name}</div>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewPackage(pkg)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Label
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditPackage(pkg)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(pkg.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{" "}
            {Math.min(currentPage * pageSize, pagination.total)} of{" "}
            {pagination.total} packages
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
