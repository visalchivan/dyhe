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
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <TeamTable />
      </div>
    </MainLayout>
  )
}
