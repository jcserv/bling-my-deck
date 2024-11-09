import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/overview')({
  component: Overview,
})

function Overview() {
  return <section className="p-2">Here are your results!</section>
}
