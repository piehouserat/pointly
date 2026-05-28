import { X } from "lucide-react"

import { useRoomTimer } from "@/components/room/room-timer-context"
import {
  Alert,
  AlertAction,
  AlertTitle,
} from "@pointly/ui/components/alert"
import { Button } from "@pointly/ui/components/button"

export function RoomTimerExpiredAlert() {
  const { status, restart, dismissExpired } = useRoomTimer()

  if (status !== "expired") return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-40 flex justify-center px-4 sm:px-6">
      <Alert className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 border-0 bg-destructive py-3 text-white shadow-lg">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <AlertTitle className="shrink-0 font-normal text-white">
            Time is up!
          </AlertTitle>
          <Button
            variant="link"
            className="h-auto p-0 font-bold text-white underline-offset-4 hover:text-white/90"
            onClick={restart}
          >
            Restart
          </Button>
        </div>
        <AlertAction className="static">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/15 hover:text-white"
            onClick={dismissExpired}
            aria-label="Dismiss"
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}
