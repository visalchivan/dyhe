import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Printer, Trash2 } from 'lucide-react'
import { usePackages } from '@/hooks/usePackages'
import { printLabel, printBulkLabels } from '@/lib/utils/directPrint'
import { toast } from 'sonner'
import type { Package } from '@/lib/api/packages'

export const Route = createFileRoute('/packages/print/')({
  component: PackagePrintPage,
})

function PackagePrintPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isPrinting, setIsPrinting] = useState(false)
  const [isBulkPrinting, setIsBulkPrinting] = useState(false)
  const [printMode, setPrintMode] = useState<'single' | 'bulk'>('single')

  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    page: 1,
    limit: 100,
    search: searchTerm,
  })

  const handlePrint = async () => {
    if (!selectedPackage) return

    setIsPrinting(true)

    try {
      // Find the selected package
      const packageToPrint = packagesData?.packages.find(
        (pkg) => pkg.id === selectedPackage
      )
      if (!packageToPrint) {
        setIsPrinting(false)
        return
      }

      await printLabel({
        id: packageToPrint.id,
        packageNumber: packageToPrint.packageNumber,
        name: packageToPrint.name,
        customerName: packageToPrint.customerName,
        customerPhone: packageToPrint.customerPhone,
        customerAddress: packageToPrint.customerAddress,
        codAmount: packageToPrint.codAmount,
        merchant: { name: packageToPrint.merchant.name },
      })

      toast.success('Print dialog opened')
      setIsPrinting(false)
    } catch (error) {
      console.error('Error printing label:', error)
      toast.error('Failed to print label')
      setIsPrinting(false)
    }
  }

  const handleBulkPrint = async () => {
    if (selectedPackages.length === 0) return

    setIsBulkPrinting(true)

    try {
      // Find all selected packages
      const packagesToPrint =
        packagesData?.packages.filter((pkg) =>
          selectedPackages.includes(pkg.id)
        ) || []

      if (packagesToPrint.length === 0) {
        setIsBulkPrinting(false)
        return
      }

      await printBulkLabels(
        packagesToPrint.map((p: Package) => ({
          id: p.id,
          packageNumber: p.packageNumber,
          name: p.name,
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          customerAddress: p.customerAddress,
          codAmount: p.codAmount,
          merchant: { name: p.merchant.name },
        }))
      )

      toast.success(`Print dialog opened for ${packagesToPrint.length} labels`)
      setIsBulkPrinting(false)
    } catch (error) {
      console.error('Bulk print failed:', error)
      toast.error('Failed to print labels')
      setIsBulkPrinting(false)
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Printer className="h-8 w-8" />
            Package Label Printer
          </h1>
          <p className="text-muted-foreground">
            Print package labels directly - 80mm x 100mm labels with QR codes
          </p>

          <div className="flex gap-2 mt-4">
            <Button
              variant={printMode === 'single' ? 'default' : 'outline'}
              onClick={() => setPrintMode('single')}
            >
              Single Print
            </Button>
            <Button
              variant={printMode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setPrintMode('bulk')}
            >
              Bulk Print
            </Button>
          </div>
        </div>

        {printMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Package to Print</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select a package</Label>
                  <Select
                    value={selectedPackage || ''}
                    onValueChange={setSelectedPackage}
                  >
                    <SelectTrigger disabled={packagesLoading}>
                      <SelectValue placeholder="Select a package to print" />
                    </SelectTrigger>
                    <SelectContent>
                      {packagesData?.packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.packageNumber} - {pkg.name} ({pkg.customerName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPackage && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        Package Selected
                      </p>
                      <p className="text-sm text-green-600">
                        Ready to print label for the selected package
                      </p>
                    </div>

                    <Button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="w-full"
                      size="lg"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      {isPrinting ? 'Opening Print Dialog...' : 'Print Label'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Label Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-semibold mb-2">No package selected</p>
                  <p className="text-sm">
                    Select a package from the dropdown to print its label
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Select Packages (Bulk)</CardTitle>
              </CardHeader>
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
                              {pkg.packageNumber} - {pkg.name}
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
                    onClick={handleBulkPrint}
                    disabled={isBulkPrinting}
                    className="w-full"
                    size="lg"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isBulkPrinting
                      ? 'Opening Print Dialog...'
                      : `Print ${selectedPackages.length} Label(s)`}
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
                              {pkg.packageNumber} - {pkg.name}
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
        )}

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
