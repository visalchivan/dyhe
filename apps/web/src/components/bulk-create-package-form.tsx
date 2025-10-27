import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Printer } from "lucide-react";
import { useBulkCreatePackages } from "@/hooks/usePackages";
import { useMerchants } from "@/hooks/useMerchants";
import type { PackageDataDto, BulkCreatePackagesDto } from "@/lib/api/packages";
import { printBulkLabels } from "@/lib/utils/directPrint";
import { toast } from "sonner";

interface BulkCreatePackageFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkCreatePackageForm({
  onSuccess,
  onCancel,
}: BulkCreatePackageFormProps) {
  const [merchantId, setMerchantId] = useState("");
  const [status, setStatus] = useState("READY");
  const [shouldPrint, setShouldPrint] = useState(false);
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
      const response = await bulkCreatePackagesMutation.mutateAsync(bulkData);
      
      // If print is checked and packages were created successfully, print labels
      if (shouldPrint && response.packages && response.packages.length > 0) {
        toast.info("Printing labels...");
        
        // Get the merchant name for printing
        const merchant = merchantsData?.merchants.find(m => m.id === merchantId);
        
        // Transform the created packages to print format
        const packagesToPrint = response.packages.map((pkg) => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          name: pkg.name || pkg.packageNumber,
          customerName: pkg.customerName,
          customerPhone: pkg.customerPhone,
          customerAddress: pkg.customerAddress,
          codAmount: pkg.codAmount,
          merchant: { name: merchant?.name || "Unknown Merchant" },
        }));
        
        try {
          await printBulkLabels(packagesToPrint);
          toast.success(`${packagesToPrint.length} labels opened for printing`);
        } catch (printError) {
          console.error("Error printing labels:", printError);
          toast.error("Failed to print labels");
        }
      }
      
      onSuccess();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Generate Rows */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Generate Rows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <p className="text-sm text-muted-foreground">
            Enter a number (1-500) to generate empty rows quickly
          </p>
        </CardContent>
      </Card>

      {/* Package Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Package Settings</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Package Details Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Package Details ({packages.length} packages)</CardTitle>
            <Button type="button" onClick={addPackage} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="print-labels"
            checked={shouldPrint}
            onCheckedChange={(checked) => setShouldPrint(checked as boolean)}
          />
          <Label htmlFor="print-labels" className="font-normal cursor-pointer flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print labels after creating packages
          </Label>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={bulkCreatePackagesMutation.isPending}>
            {bulkCreatePackagesMutation.isPending
              ? "Creating..."
              : `Create ${packages.length} Packages`}
          </Button>
        </div>
      </div>
    </form>
  );
}
