import { useCallback, useEffect, useState } from "react"

import { fetchRoomState } from "@/lib/api/room-state"
import type { RoomState } from "@/lib/api/room-state"

/** One-shot room state fetch (no polling). Prefer `useRoomRealtime` in the room UI. */
export function useRoomState(roomId: string, enabled = true) {
  const [state, setState] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchRoomState(roomId)
      setState(next)
      setError(null)
      return next
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room state")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  return { state, error, isLoading, refresh, setState }
}
