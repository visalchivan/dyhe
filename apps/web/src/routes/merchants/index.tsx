import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/merchants/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/merchants/"!</div>
}
