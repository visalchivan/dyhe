import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <MainLayout>
      <div>Hello "/dashboard/"!</div>
    </MainLayout>
  )
}
