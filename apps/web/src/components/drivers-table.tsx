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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Lock,
  MoreVertical,
} from "lucide-react";
import { useDrivers, useDeleteDriver } from "@/hooks/useDrivers";
import type { Driver } from "@/lib/api/drivers";
import { CreateDriverModal } from "@/components/create-driver-modal";
import { EditDriverModal } from "@/components/edit-driver-modal";
import { toast } from "sonner";

export function DriversTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const { data, isLoading, refetch } = useDrivers({
    page: currentPage,
    limit: pageSize,
    search: searchText || undefined,
  });

  const deleteDriverMutation = useDeleteDriver();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriverMutation.mutateAsync(id);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "ON_DUTY":
        return "secondary";
      case "OFF_DUTY":
        return "outline";
      case "SUSPENDED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "destructive";
      default:
        return "outline";
    }
  };

  const drivers = data?.drivers || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(driver.status) as any}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDriverStatusColor(driver.driverStatus) as any}>
                      {driver.driverStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>${driver.deliverFee}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(driver.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to{" "}
            {Math.min(currentPage * pageSize, pagination.total)} of{" "}
            {pagination.total} drivers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateDriverModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      {selectedDriver && (
        <EditDriverModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          driver={selectedDriver}
        />
      )}
    </div>
  );
}

