import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, User } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import type { Package } from "@/lib/api/packages";

interface ScannedPackagesListProps {
  packages: (Package & { scannedAt: string })[];
  onRemovePackage: (packageNumber: string) => void;
  selectedDriver: string | null;
  onDriverSelect: (driverId: string) => void;
}

export function ScannedPackagesList({
  packages,
  onRemovePackage,
  selectedDriver,
  onDriverSelect,
}: ScannedPackagesListProps) {
  const { data: driversData } = useDrivers({ page: 1, limit: 100 });

  return (
    <div className="space-y-4">
      {/* Driver Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Driver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Choose which driver to assign these packages to</Label>
          <Select value={selectedDriver || ""} onValueChange={onDriverSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              {driversData?.drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name} ({driver.email || driver.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Packages List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Packages ({packages.length})</h3>
        <div className="space-y-2">
          {packages.map((pkg, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{index + 1}</span>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {pkg.packageNumber}
                    </code>
                    <Badge variant="default">{pkg.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Added: {new Date(pkg.scannedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePackage(pkg.packageNumber)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
