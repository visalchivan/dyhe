import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PackageScanForm } from '@/components/package-scan-form'
import { ScannedPackagesList } from '@/components/scanned-packages-list'
import { useBulkAssignPackages } from '@/hooks/usePackages'
import { CheckCircle } from 'lucide-react'
import type { Package } from '@/lib/api/packages'

export const Route = createFileRoute('/assign/')({
  component: AssignPackagesPage,
})

function AssignPackagesPage() {
  const [scannedPackages, setScannedPackages] = useState<
    (Package & { scannedAt: string })[]
  >([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  
  const bulkAssignMutation = useBulkAssignPackages();

  const handlePackageScanned = (
    packageData: Package & { scannedAt: string }
  ) => {
    // Check if package is already scanned
    const isAlreadyScanned = scannedPackages.some(
      (pkg) => pkg.packageNumber === packageData.packageNumber
    );

    if (isAlreadyScanned) {
      return; // Don't add duplicate
    }

    setScannedPackages((prev) => [...prev, packageData]);
  };

  const handleRemovePackage = (packageNumber: string) => {
    setScannedPackages((prev) =>
      prev.filter((pkg) => pkg.packageNumber !== packageNumber)
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedDriver || scannedPackages.length === 0) {
      return;
    }

    const packageNumbers = scannedPackages.map((pkg) => pkg.packageNumber);

    bulkAssignMutation.mutate(
      {
        driverId: selectedDriver,
        packageNumbers,
        status: "READY",
      },
      {
        onSuccess: () => {
          // Clear scanned packages after successful assignment
          setScannedPackages([]);
          setSelectedDriver(null);
        },
      }
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Assign Packages
          </h1>
          <p className="text-muted-foreground">
            Manually enter package numbers to assign them to drivers in bulk
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manual Entry Section */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold">Manual Entry</h2>
            <PackageScanForm onPackageScanned={handlePackageScanned} />
          </div>

          {/* Scanned Packages Section */}
          <div className="lg:col-span-2">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Scanned Packages ({scannedPackages.length})
                </h2>
                {scannedPackages.length > 0 && (
                  <Button
                    onClick={handleBulkAssign}
                    disabled={!selectedDriver || bulkAssignMutation.isPending}
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {bulkAssignMutation.isPending
                      ? "Assigning..."
                      : "Assign to Driver"}
                  </Button>
                )}
              </div>
            </div>
            <div>
              {scannedPackages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-semibold mb-2">No packages scanned yet</p>
                  <p className="text-sm">
                    Start adding packages using the manual entry form on the
                    left
                  </p>
                </div>
              ) : (
                <ScannedPackagesList
                  packages={scannedPackages}
                  onRemovePackage={handleRemovePackage}
                  selectedDriver={selectedDriver}
                  onDriverSelect={setSelectedDriver}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
