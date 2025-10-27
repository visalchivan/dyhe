import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useBulkCreatePackages } from "@/hooks/usePackages";
import { useMerchants } from "@/hooks/useMerchants";
import type { PackageDataDto, BulkCreatePackagesDto } from "@/lib/api/packages";
import { toast } from "sonner";

interface BulkCreatePackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkCreatePackageModal({
  open,
  onOpenChange,
}: BulkCreatePackageModalProps) {
  const [merchantId, setMerchantId] = useState("");
  const [status, setStatus] = useState("READY");
  const [packages, setPackages] = useState<PackageDataDto[]>([
    {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      codAmount: 0,
      deliveryFee: 0,
    },
  ]);
  const [rowCount, setRowCount] = useState(1);

  const { data: merchantsData } = useMerchants({ page: 1, limit: 1000 });
  const bulkCreatePackagesMutation = useBulkCreatePackages();

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        codAmount: 0,
        deliveryFee: 0,
      },
    ]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const generateRows = () => {
    if (rowCount < 1 || rowCount > 500) {
      toast.error("Please enter a number between 1 and 500");
      return;
    }

    const newPackages = Array.from({ length: rowCount }, () => ({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      codAmount: 0,
      deliveryFee: 0,
    }));

    setPackages(newPackages);
    toast.success(`Generated ${rowCount} empty rows`);
  };

  const updatePackage = (
    index: number,
    field: keyof PackageDataDto,
    value: string | number
  ) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updatedPackages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchantId) {
      toast.error("Please select a merchant");
      return;
    }

    const validPackages = packages.filter(
      (pkg) =>
        pkg.customerName.trim() !== "" &&
        pkg.customerPhone.trim() !== "" &&
        pkg.customerAddress.trim() !== ""
    );

    if (validPackages.length === 0) {
      toast.error("Please fill in all required fields for at least one package");
      return;
    }

    const bulkData: BulkCreatePackagesDto = {
      merchantId,
      status,
      packages: validPackages,
    };

    try {
      await bulkCreatePackagesMutation.mutateAsync(bulkData);
      onOpenChange(false);
      // Reset form
      setMerchantId("");
      setStatus("READY");
      setPackages([
        {
          customerName: "",
          customerPhone: "",
          customerAddress: "",
          codAmount: 0,
          deliveryFee: 0,
        },
      ]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleMerchantChange = (value: string) => {
    setMerchantId(value);
    const selectedMerchant = merchantsData?.merchants.find(
      (m) => m.id === value
    );
    if (selectedMerchant) {
      const deliveryFee = Number(selectedMerchant.deliverFee);
      setPackages(packages.map((pkg) => ({ ...pkg, deliveryFee })));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Packages</DialogTitle>
          <DialogDescription>
            Add multiple packages at once. Fill in customer details for each
            package.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Generate Rows */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <Label className="text-base font-semibold mb-3 block">
              Quick Generate Rows
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={500}
                value={rowCount}
                onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                placeholder="How many packages?"
                className="flex-1"
              />
              <Button type="button" onClick={generateRows}>
                Generate Rows
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter a number (1-500) to generate empty rows quickly
            </p>
          </div>

          {/* Package Settings */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Package Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchant">Merchant *</Label>
                <Select value={merchantId} onValueChange={handleMerchantChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchantsData?.merchants.map((merchant) => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.name} - {merchant.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Package Details Table */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                Package Details ({packages.length} packages)
              </h3>
              <Button type="button" onClick={addPackage} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name *</TableHead>
                    <TableHead>Phone *</TableHead>
                    <TableHead>Address *</TableHead>
                    <TableHead>COD Amount</TableHead>
                    <TableHead>Delivery Fee</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={pkg.customerName}
                          placeholder="Customer name"
                          onChange={(e) =>
                            updatePackage(index, "customerName", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={pkg.customerPhone}
                          placeholder="Phone (digits only)"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            updatePackage(index, "customerPhone", value);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={pkg.customerAddress}
                          placeholder="Address"
                          onChange={(e) =>
                            updatePackage(
                              index,
                              "customerAddress",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pkg.codAmount || 0}
                          placeholder="0.00"
                          onChange={(e) =>
                            updatePackage(
                              index,
                              "codAmount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pkg.deliveryFee || 0}
                          placeholder="0.00"
                          onChange={(e) =>
                            updatePackage(
                              index,
                              "deliveryFee",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackage(index)}
                          disabled={packages.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={bulkCreatePackagesMutation.isPending}>
              {bulkCreatePackagesMutation.isPending
                ? "Creating..."
                : `Create ${packages.length} Packages`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
