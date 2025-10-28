import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatePackage } from "@/hooks/usePackages";
import type { Package } from "@/lib/api/packages";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

interface EditPackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: Package | null;
}

const statusOptions = [
  { value: "RECEIVED", label: "Received" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERING", label: "Delivering" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export function EditPackageModal({ open, onOpenChange, packageData }: EditPackageModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    codAmount: "0",
    deliveryFee: "0",
    status: "RECEIVED",
  });

  const updatePackageMutation = useUpdatePackage();

  useEffect(() => {
    if (packageData) {
      setFormData({
        customerName: packageData.customerName,
        customerPhone: packageData.customerPhone,
        customerAddress: packageData.customerAddress,
        codAmount: packageData.codAmount.toString(),
        deliveryFee: packageData.deliveryFee.toString(),
        status: packageData.status,
      });
    }
  }, [packageData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageData) return;
    
    try {
      await updatePackageMutation.mutateAsync({
        id: packageData.id,
        data: {
          ...formData,
          codAmount: parseFloat(formData.codAmount),
          deliveryFee: parseFloat(formData.deliveryFee),
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!packageData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Package: {packageData.packageNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="customerName">
                  Customer Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="customerPhone">
                  Customer Phone <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="customerAddress">
                  Customer Address <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  required
                  rows={2}
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="codAmount">
                  COD Amount <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="codAmount"
                  type="number"
                  step="0.01"
                  value={formData.codAmount}
                  onChange={(e) => setFormData({ ...formData, codAmount: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="deliveryFee">
                  Delivery Fee <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePackageMutation.isPending}>
              {updatePackageMutation.isPending ? "Updating..." : "Update Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
