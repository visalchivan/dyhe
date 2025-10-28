"use client"

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreVertical, RefreshCw, Eye, Printer, PackagePlus } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePackages, useDeletePackage } from "@/hooks/usePackages";
import type { Package } from "@/lib/api/packages";
import { EditPackageModal } from "@/components/edit-package-modal";
import { toast } from "sonner";

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

interface PackagesTableProps {
  onViewPackage: (packageData: Package) => void;
}

export function PackagesTable({ onViewPackage }: PackagesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState<Package | null>(null);

  const { data, isLoading, refetch } = usePackages({
    page: 1,
    limit: 1000, // Get all packages for client-side filtering
  });

  const deletePackageMutation = useDeletePackage();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackageMutation.mutateAsync(id);
        toast.success("Package deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete package");
      }
    }
  };

  const handleEdit = (packageData: Package) => {
    setSelectedPackage(packageData);
    setEditModalOpen(true);
  };

  const packages = data?.packages || [];

  const columns: ColumnDef<Package>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "packageNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Package #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">{row.getValue("packageNumber")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("customerName")}</div>,
    },
    {
      accessorKey: "customerPhone",
      header: "Phone",
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("customerPhone")}</div>,
    },
    {
      accessorKey: "customerAddress",
      header: "Address",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("customerAddress")}</div>,
    },
    {
      accessorKey: "codAmount",
      header: "COD",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("codAmount"));
        return <div>${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "deliveryFee",
      header: "Fee",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("deliveryFee"));
        return <div>${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "merchant",
      header: "Merchant",
      cell: ({ row }) => {
        const merchant = row.getValue("merchant") as any;
        return (
          <div>
            <div className="font-medium">{merchant.name}</div>
            <div className="text-sm text-muted-foreground">{merchant.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.getValue("driver") as any;
        return driver ? (
          <div className="font-medium">{driver.name}</div>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.getValue("status")) as any}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const packageData = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(packageData.id)}
              >
                Copy package ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewPackage(packageData)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(packageData)}>
                Edit package
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(packageData.id)}>
                Delete package
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: packages,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter packages..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Link to="/packages/bulk-create" className="ml-auto">
          <Button>
            <PackagePlus className="h-4 w-4 mr-2" />
            Bulk Create
          </Button>
        </Link>
        <Button onClick={() => refetch()} variant="outline" className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No packages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {selectedPackage && (
        <EditPackageModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          packageData={selectedPackage}
        />
      )}
    </div>
  );
}

