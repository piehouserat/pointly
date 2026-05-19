import { useCallback, useEffect, useState } from "react"

import { fetchRoomState } from '@/lib/api/room-state';
import type { RoomState } from '@/lib/api/room-state';

const pollMs = 2000

export function useRoomState(roomId: string, enabled = true) {
  const [state, setState] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchRoomState(roomId)
      setState(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room state")
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (!enabled) return
    void refresh()
    const id = window.setInterval(() => void refresh(), pollMs)
    return () => window.clearInterval(id)
  }, [enabled, refresh])

  return { state, error, isLoading, refresh, setState }
}
