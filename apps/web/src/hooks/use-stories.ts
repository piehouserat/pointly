import { useCallback, useEffect, useState } from "react"

import { fetchStories, type Story } from "@/lib/api/stories"

/** One-shot stories fetch (no polling). Prefer `useRoomRealtime` in the room UI. */
export function useStories(roomId: string, enabled = true) {
  const [stories, setStories] = useState<Array<Story>>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchStories(roomId)
      setStories(next)
      setError(null)
      return next
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stories")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  return { stories, error, isLoading, refresh, setStories }
}
