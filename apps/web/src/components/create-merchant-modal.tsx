import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMerchant } from "@/hooks/useMerchants";

interface CreateMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bankOptions = [
  { value: "ABA", label: "ABA Bank" },
  { value: "ACELEDA", label: "Acleda Bank" },
  { value: "WING", label: "Wing Bank" },
  { value: "CANADIA", label: "Canadia Bank" },
  { value: "SATHAPANA", label: "Sathapana Bank" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export function CreateMerchantModal({ open, onOpenChange }: CreateMerchantModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    deliverFee: "0",
    address: "",
    bank: "",
    bankAccountNumber: "",
    bankAccountName: "",
    googleMapsUrl: "",
    status: "ACTIVE",
  });

  const createMerchantMutation = useCreateMerchant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMerchantMutation.mutateAsync({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        deliverFee: parseFloat(formData.deliverFee),
        address: formData.address,
        bank: formData.bank,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName || undefined,
        googleMapsUrl: formData.googleMapsUrl || undefined,
        status: formData.status,
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        deliverFee: "0",
        address: "",
        bank: "",
        bankAccountNumber: "",
        bankAccountName: "",
        googleMapsUrl: "",
        status: "ACTIVE",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Merchant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Merchant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter merchant name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address (optional)"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="Enter phone number (digits only)"
              />
            </div>
            <div>
              <Label htmlFor="deliverFee">Delivery Fee ($) *</Label>
              <Input
                id="deliverFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.deliverFee}
                onChange={(e) => setFormData({ ...formData, deliverFee: e.target.value })}
                required
                placeholder="Enter delivery fee"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="Enter full address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bank">Bank *</Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bankAccountNumber">Account Number *</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                required
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="bankAccountName">Account Name (Optional)</Label>
              <Input
                id="bankAccountName"
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                placeholder="Enter account name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="googleMapsUrl">Google Maps URL (Optional)</Label>
            <Input
              id="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              placeholder="Enter Google Maps URL"
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMerchantMutation.isPending}>
              {createMerchantMutation.isPending ? "Creating..." : "Create Merchant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
