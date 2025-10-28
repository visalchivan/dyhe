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
import { useUpdateMerchant } from "@/hooks/useMerchants";
import type { Merchant } from "@/lib/api/merchants";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

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
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="deliverFee">
                  Delivery Fee <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="deliverFee"
                  type="number"
                  step="0.01"
                  value={formData.deliverFee}
                  onChange={(e) => setFormData({ ...formData, deliverFee: e.target.value })}
                  required
                />
              </Field>
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={2}
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="bank">
                  Bank <span className="text-red-500">*</span>
                </FieldLabel>
                <Select
                  value={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABA">ABA Bank</SelectItem>
                    <SelectItem value="ACELEDA">Aceleda Bank</SelectItem>
                    <SelectItem value="WING">Wing Bank</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="bankAccountNumber">
                  Bank Account Number <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  required
                />
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="bankAccountName">Bank Account Name</FieldLabel>
                <Input
                  id="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="googleMapsUrl">Google Maps URL</FieldLabel>
                <Input
                  id="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

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
