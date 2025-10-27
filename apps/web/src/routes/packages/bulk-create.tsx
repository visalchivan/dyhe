import { createFileRoute, useNavigate } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { BulkCreatePackageForm } from '@/components/bulk-create-package-form'

export const Route = createFileRoute('/packages/bulk-create')({
  component: BulkCreatePackagesPage,
})

function BulkCreatePackagesPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/packages' })
  }

  const handleCancel = () => {
    navigate({ to: '/packages' })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bulk Create Packages</h1>
            <p className="text-gray-500 mt-1">
              Create multiple packages at once by filling in customer details
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        <BulkCreatePackageForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  )
}
