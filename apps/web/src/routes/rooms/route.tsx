import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rooms")({
  component: RoomLayout,
})

/** Fullscreen shell for in-room experience (separate from marketing pages). */
function RoomLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Outlet />
    </div>
  )
}
