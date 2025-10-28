import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { MerchantsTable } from '@/components/merchants-table'

export const Route = createFileRoute('/merchants/')({
  component: MerchantsPage,
})

function MerchantsPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Merchants</h1>
          <p className="text-sm text-muted-foreground">Manage your merchants and their statuses</p>
        </div>
        <MerchantsTable />
      </div>
    </MainLayout>
  )
}
