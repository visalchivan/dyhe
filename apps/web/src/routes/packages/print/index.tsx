import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  // Get all packages (without search filter) for the selected packages list
  const { data: allPackagesData } = usePackages({
    page: 1,
    limit: 1000, // Get more packages to ensure we have all selected ones
  })

  const handlePrint = async () => {
    if (selectedPackages.length === 0) return

    try {
      // Find all selected packages
      const packagesToPrint =
        allPackagesData?.packages.filter((pkg) =>
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
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search packages</Label>
                <Input
                  placeholder="Search by package number, customer name, phone, or address..."
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

                <div className="max-h-[calc(100vh-430px)] overflow-y-auto space-y-2">
                  {packagesData?.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`flex items-start justify-between p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedPackages.includes(pkg.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => handlePackageSelect(pkg.id, !selectedPackages.includes(pkg.id))}
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
                        onClick={(e) => e.stopPropagation()} // Prevent double-click
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
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Selected Packages ({selectedPackages.length})</h2>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {selectedPackages.length > 0 ? (
                <div className="space-y-2 overflow-y-auto">
                  {selectedPackages.map((packageId) => {
                    // Find the package by ID from all packages (not filtered by search)
                    const pkg = allPackagesData?.packages.find(p => p.id === packageId)
                    if (!pkg) return null
                    
                    return (
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
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-semibold mb-2">No packages selected</p>
                  <p className="text-sm">
                    Select packages from the list on the left
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
