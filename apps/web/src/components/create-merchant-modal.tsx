import { useState } from "react";
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
import { useCreateMerchant } from "@/hooks/useMerchants";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

interface CreateMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMerchantModal({ open, onOpenChange }: CreateMerchantModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    deliverFee: "0",
    address: "",
    status: "ACTIVE",
    bank: "ABA",
    bankAccountNumber: "",
    bankAccountName: "",
    googleMapsUrl: "",
  });

  const createMerchantMutation = useCreateMerchant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMerchantMutation.mutateAsync({
        ...formData,
        deliverFee: parseFloat(formData.deliverFee),
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        deliverFee: "0",
        address: "",
        status: "ACTIVE",
        bank: "ABA",
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
          <DialogTitle>Create New Merchant</DialogTitle>
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
            <Button type="submit" disabled={createMerchantMutation.isPending}>
              {createMerchantMutation.isPending ? "Creating..." : "Create Merchant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
