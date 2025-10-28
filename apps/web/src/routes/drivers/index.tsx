import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { DriversTable } from '@/components/drivers-table'

export const Route = createFileRoute('/drivers/')({
  component: DriversPage,
})

function DriversPage() {
  return (
    <MainLayout>
      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-sm text-muted-foreground">Manage your drivers and their statuses</p>
        </div>
        <DriversTable />
      </div>
    </MainLayout>
  )
}
