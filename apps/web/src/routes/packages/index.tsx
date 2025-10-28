import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { PackagesTable } from '@/components/packages-table'
import { ViewPackageDialog } from '@/components/view-package-dialog'
import { useState } from 'react'
import type { Package } from '@/lib/api/packages'

export const Route = createFileRoute('/packages/')({
  component: PackagesPage,
})

function PackagesPage() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const handleEditPackage = (packageData: Package) => {
    // TODO: Implement edit package modal
    console.log('Edit package', packageData)
  }

  const handleViewPackage = (packageData: Package) => {
    setSelectedPackage(packageData)
    setViewDialogOpen(true)
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-sm text-muted-foreground">Manage packages and their details</p>
        </div>
        <PackagesTable
          onViewPackage={handleViewPackage}
        />

        {/* Modals */}
        <ViewPackageDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          packageData={selectedPackage}
          onEdit={() => {
            if (selectedPackage) handleEditPackage(selectedPackage);
          }}
        />
      </div>
    </MainLayout>
  )
}
