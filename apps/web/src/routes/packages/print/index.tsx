import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePackages } from '@/hooks/usePackages'
import MainLayout from '@/layouts/MainLayout'
import type { Package } from '@/lib/api/packages'
import { printBulkLabels } from '@/lib/utils/directPrint'
import { toast } from 'sonner'
import { Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/packages/print/')({
  component: PrintPackagesPage,
})

function PrintPackagesPage() {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { data: packagesData } = usePackages({
    page: 1,
    limit: 100,
    search: searchTerm,
  })

  const handlePrint = async () => {
    if (selectedPackages.length === 0) return

    try {
      // Find all selected packages
      const packagesToPrint =
        packagesData?.packages.filter((pkg) =>
          selectedPackages.includes(pkg.id)
        ) || []

      await printBulkLabels(
        packagesToPrint.map((p: Package) => ({
          id: p.id,
          packageNumber: p.packageNumber,
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          customerAddress: p.customerAddress,
          codAmount: p.codAmount,
          merchant: { name: p.merchant.name },
        }))
      )

      toast.success(`${packagesToPrint.length} labels opened for printing`)
    } catch (error) {
      console.error('Bulk print failed:', error)
      toast.error('Failed to print labels')
    }
  }

  const handlePackageSelect = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages([...selectedPackages, packageId])
    } else {
      setSelectedPackages(selectedPackages.filter((id) => id !== packageId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPackageIds = packagesData?.packages.map((pkg) => pkg.id) || []
      setSelectedPackages(allPackageIds)
    } else {
      setSelectedPackages([])
    }
  }

  const handleRemoveFromBulk = (packageId: string) => {
    setSelectedPackages(selectedPackages.filter((id) => id !== packageId))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Package Label Printer
          </h1>
          <p className="text-muted-foreground">
            Print package labels directly - 80mm x 100mm labels with QR codes
          </p>
        </div>

        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search packages</Label>
                  <Input
                    placeholder="Search packages by name or package number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={
                        selectedPackages.length ===
                        (packagesData?.packages.length || 0)
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                    />
                    <Label>
                      Select All ({packagesData?.packages.length || 0} packages)
                    </Label>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {packagesData?.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-start justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {pkg.packageNumber}
                            </span>
                            <Badge variant="default">{pkg.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pkg.customerName} • {pkg.customerPhone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            COD: ${Number(pkg.codAmount).toFixed(2)}
                          </p>
                        </div>
                        <Checkbox
                          checked={selectedPackages.includes(pkg.id)}
                          onCheckedChange={(checked) =>
                            handlePackageSelect(pkg.id, checked as boolean)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPackages.length > 0 && (
                  <Button
                    onClick={handlePrint}
                    className="w-full"
                    size="lg"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print {selectedPackages.length} Label(s)
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Packages ({selectedPackages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPackages.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {packagesData?.packages
                      .filter((pkg) => selectedPackages.includes(pkg.id))
                      .map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-start justify-between p-3 border rounded-lg"
                        >
                          <div className="space-y-1 flex-1">
                            <span className="font-semibold text-sm">
                              {pkg.packageNumber}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {pkg.customerName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromBulk(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-semibold mb-2">No packages selected</p>
                    <p className="text-sm">
                      Select packages from the list on the left
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Print Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Direct Printing:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Select package(s) from the dropdown or list</li>
                <li>Click &quot;Print Label(s)&quot; button</li>
                <li>Your browser&apos;s print dialog will open automatically</li>
                <li>Select your printer and click Print (no PDF step needed!)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Label Specifications:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Label size: 80mm x 100mm</li>
                <li>
                  Includes QR codes, tracking numbers, and all package details
                </li>
                <li>Each label prints on a separate page</li>
                <li>Optimized for thermal printers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
