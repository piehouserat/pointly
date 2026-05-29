import { useEffect } from "react"

import { fetchRoom } from "@/lib/api/rooms"
import type { RoomWithRelations } from "@/lib/api/rooms"

const pollMs = 10_000

type UseRoomLobbySyncOptions = {
  roomId: string
  enabled: boolean
  onRoomChange: (room: RoomWithRelations) => void
}

/** Polls room data while the join dialog is shown (before the user is a participant). */
export function useRoomLobbySync({
  roomId,
  enabled,
  onRoomChange,
}: UseRoomLobbySyncOptions) {
  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function refresh() {
      const next = await fetchRoom(roomId)
      if (!cancelled) {
        onRoomChange(next)
      }
    }

    void refresh()
    const interval = window.setInterval(() => {
      void refresh().catch(() => undefined)
    }, pollMs)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [enabled, onRoomChange, roomId])
}
