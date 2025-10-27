import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Package } from "@/lib/api/packages";

interface PackageScanFormProps {
  onPackageScanned: (packageData: Package & { scannedAt: string }) => void;
}

export function PackageScanForm({ onPackageScanned }: PackageScanFormProps) {
  const [scanResult, setScanResult] = useState("");
  const [error, setError] = useState("");

  const handleManualScan = () => {
    if (!scanResult.trim()) {
      setError("Please enter a package number");
      return;
    }

    // Simulate package data from scan
    const packageData = {
      id: `temp-${Date.now()}`,
      packageNumber: scanResult.trim(),
      name: `Package ${scanResult.trim()}`,
      customerName: "Scanned Customer",
      customerPhone: "N/A",
      customerAddress: "N/A",
      codAmount: 0,
      deliveryFee: 0,
      status: "READY",
      merchantId: "temp-merchant",
      merchant: {
        id: "temp-merchant",
        name: "Scanned Merchant",
        email: "merchant@example.com",
        phone: "N/A",
      },
      driverId: undefined,
      driver: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scannedAt: new Date().toISOString(),
    } as Package & { scannedAt: string };

    onPackageScanned(packageData);
    setScanResult("");
    setError("");
    toast.success(`Package ${scanResult.trim()} added successfully!`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualScan();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Enter package number to add it to the scanned list
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter package number (e.g., DYHE123456ABC)"
          value={scanResult}
          onChange={(e) => {
            setScanResult(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleManualScan}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          💡 Tip: Press Enter or click "Add Package" to add the package
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
