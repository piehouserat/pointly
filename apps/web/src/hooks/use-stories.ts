import { useCallback, useEffect, useState } from "react"

import { fetchStories, type Story } from "@/lib/api/stories"

const pollMs = 2000

export function useStories(roomId: string, enabled = true) {
  const [stories, setStories] = useState<Array<Story>>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchStories(roomId)
      setStories(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stories")
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

  return { stories, error, isLoading, refresh, setStories }
}
