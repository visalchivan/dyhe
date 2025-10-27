import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useUpdateDriver } from "@/hooks/useDrivers";
import type { Driver } from "@/lib/api/drivers";

interface EditDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
}

export function EditDriverModal({ open, onOpenChange, driver }: EditDriverModalProps) {
  const [formData, setFormData] = useState({
    name: driver.name,
    phone: driver.phone,
    email: driver.email || "",
    deliverFee: driver.deliverFee.toString(),
    driverStatus: driver.driverStatus,
    bank: driver.bank,
    bankAccountNumber: driver.bankAccountNumber,
    bankAccountName: driver.bankAccountName || "",
    googleMapsUrl: driver.googleMapsUrl || "",
  });

  const updateDriverMutation = useUpdateDriver();

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        phone: driver.phone,
        email: driver.email || "",
        deliverFee: driver.deliverFee.toString(),
        driverStatus: driver.driverStatus,
        bank: driver.bank,
        bankAccountNumber: driver.bankAccountNumber,
        bankAccountName: driver.bankAccountName || "",
        googleMapsUrl: driver.googleMapsUrl || "",
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateDriverMutation.mutateAsync({
        id: driver.id,
        data: {
          ...formData,
          deliverFee: parseFloat(formData.deliverFee),
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-deliverFee">Delivery Fee *</Label>
              <Input
                id="edit-deliverFee"
                type="number"
                step="0.01"
                value={formData.deliverFee}
                onChange={(e) => setFormData({ ...formData, deliverFee: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-driverStatus">Driver Status</Label>
              <Select
                value={formData.driverStatus}
                onValueChange={(value) => setFormData({ ...formData, driverStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                  <SelectItem value="ON_DUTY">On Duty</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-bank">Bank</Label>
              <Input
                id="edit-bank"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-bankAccountNumber">Bank Account Number</Label>
              <Input
                id="edit-bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-bankAccountName">Bank Account Name</Label>
              <Input
                id="edit-bankAccountName"
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-googleMapsUrl">Google Maps URL</Label>
              <Input
                id="edit-googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateDriverMutation.isPending}>
              {updateDriverMutation.isPending ? "Updating..." : "Update Driver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

