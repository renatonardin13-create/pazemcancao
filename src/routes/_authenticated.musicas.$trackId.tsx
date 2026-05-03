import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/musicas/$trackId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/musicas/$trackId"!</div>
}
