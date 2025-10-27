import { useEffect, useState } from "react";
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
import { useUpdateMerchant } from "@/hooks/useMerchants";
import type { Merchant } from "@/lib/api/merchants";

interface EditMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant;
}

export function EditMerchantModal({ open, onOpenChange, merchant }: EditMerchantModalProps) {
  const [formData, setFormData] = useState({
    name: merchant.name,
    phone: merchant.phone,
    email: merchant.email || "",
    deliverFee: merchant.deliverFee.toString(),
    address: merchant.address,
    status: merchant.status,
    bank: merchant.bank,
    bankAccountNumber: merchant.bankAccountNumber,
    bankAccountName: merchant.bankAccountName || "",
    googleMapsUrl: merchant.googleMapsUrl || "",
  });

  const updateMerchantMutation = useUpdateMerchant();

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name,
        phone: merchant.phone,
        email: merchant.email || "",
        deliverFee: merchant.deliverFee.toString(),
        address: merchant.address,
        status: merchant.status,
        bank: merchant.bank,
        bankAccountNumber: merchant.bankAccountNumber,
        bankAccountName: merchant.bankAccountName || "",
        googleMapsUrl: merchant.googleMapsUrl || "",
      });
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMerchantMutation.mutateAsync({
        id: merchant.id,
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
          <DialogTitle>Edit Merchant</DialogTitle>
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
              <Label htmlFor="edit-status">Merchant Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
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
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Enter full address"
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-googleMapsUrl">Google Maps URL (Optional)</Label>
              <Input
                id="edit-googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                placeholder="Enter Google Maps URL"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMerchantMutation.isPending}>
              {updateMerchantMutation.isPending ? "Updating..." : "Update Merchant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

