import { createFileRoute } from '@tanstack/react-router'
import MainLayout from '@/layouts/MainLayout'
import { TeamTable } from '@/components/team-table'

export const Route = createFileRoute('/team/')({
  component: TeamPage,
})

function TeamPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Members</h1>
        </div>
        <TeamTable />
      </div>
    </MainLayout>
  )
}
