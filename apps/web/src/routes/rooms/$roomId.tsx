import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@pointly/ui/components/button"

export const Route = createFileRoute("/rooms/$roomId")({
  component: RoomPage,
})

function RoomPage() {
  const { roomId } = Route.useParams()

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Room</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Room <span className="font-mono text-foreground">{roomId}</span> was created
        successfully. The room UI is coming next.
      </p>
      <Link to="/" className={buttonVariants({ variant: "outline", className: "w-fit" })}>
        <ArrowLeft data-icon="inline-start" />
        Back to home
      </Link>
    </main>
  )
}
