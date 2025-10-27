import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { DriversTable } from '@/components/drivers-table'

export const Route = createFileRoute('/drivers/')({
  component: DriversPage,
})

function DriversPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Drivers</h1>
        </div>
        <DriversTable />
      </div>
    </MainLayout>
  )
}
