import { useState } from "react";
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
import { useCreateDriver } from "@/hooks/useDrivers";

interface CreateDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDriverModal({ open, onOpenChange }: CreateDriverModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    deliverFee: "0",
    driverStatus: "OFF_DUTY",
    bank: "",
    bankAccountNumber: "",
    bankAccountName: "",
    googleMapsUrl: "",
  });

  const createDriverMutation = useCreateDriver();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createDriverMutation.mutateAsync({
        ...formData,
        deliverFee: parseFloat(formData.deliverFee),
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        deliverFee: "0",
        driverStatus: "OFF_DUTY",
        bank: "",
        bankAccountNumber: "",
        bankAccountName: "",
        googleMapsUrl: "",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="deliverFee">Delivery Fee *</Label>
              <Input
                id="deliverFee"
                type="number"
                step="0.01"
                value={formData.deliverFee}
                onChange={(e) => setFormData({ ...formData, deliverFee: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="driverStatus">Driver Status</Label>
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
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bankAccountName">Bank Account Name</Label>
              <Input
                id="bankAccountName"
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
              <Input
                id="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDriverMutation.isPending}>
              {createDriverMutation.isPending ? "Creating..." : "Create Driver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

