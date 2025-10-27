import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import type { Package } from "@/lib/api/packages";

interface ViewPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: Package | null;
  onEdit: () => void;
}

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

export function ViewPackageDialog({ open, onOpenChange, packageData, onEdit }: ViewPackageDialogProps) {
  if (!packageData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Package Details</span>
            <Badge variant={getStatusColor(packageData.status) as any}>
              {packageData.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>View detailed information about this package.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Package Information */}
          <div>
            <h3 className="font-semibold mb-3">Package Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Package Number</label>
                <p className="text-base font-mono font-medium">{packageData.packageNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base">{packageData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">COD Amount</label>
                <p className="text-base font-semibold">${Number(packageData.codAmount).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Fee</label>
                <p className="text-base font-semibold">${Number(packageData.deliveryFee).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                <p className="text-base">{packageData.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base font-mono">{packageData.customerPhone}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-base">{packageData.customerAddress}</p>
              </div>
            </div>
          </div>

          {/* Merchant Information */}
          <div>
            <h3 className="font-semibold mb-3">Merchant Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Merchant Name</label>
                <p className="text-base font-medium">{packageData.merchant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base">{packageData.merchant.phone}</p>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {packageData.driver && (
            <div>
              <h3 className="font-semibold mb-3">Driver Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Driver Name</label>
                  <p className="text-base font-medium">{packageData.driver.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div>
            <h3 className="font-semibold mb-3">Timestamps</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-base">{new Date(packageData.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-base">{new Date(packageData.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => {
              onEdit();
              onOpenChange(false);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Package
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
