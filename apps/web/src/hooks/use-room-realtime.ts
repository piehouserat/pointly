import { useCallback, useEffect, useRef, useState } from "react"

import { fetchRoomState } from "@/lib/api/room-state"
import type { RoomState } from "@/lib/api/room-state"
import { fetchStories } from "@/lib/api/stories"
import type { Story } from "@/lib/api/stories"
import { applyRoomRealtimeEvent } from "@/lib/realtime/apply-event"
import {
  isIncrementalRoomEvent,
  parseRoomRealtimeEvent,
} from "@/lib/realtime/events"
import type { RoomRealtimeEvent } from "@/lib/realtime/events"
import { roomWebSocketUrl } from "@/lib/realtime/ws-url"

const debounceMs = 150
const fallbackPollMs = 30_000
const maxReconnectDelayMs = 30_000

type UseRoomRealtimeOptions = {
  enabled?: boolean
  loadStories?: boolean
  participantId?: string
}

export function useRoomRealtime(
  roomId: string,
  {
    enabled = true,
    loadStories = true,
    participantId,
  }: UseRoomRealtimeOptions = {}
) {
  const [state, setState] = useState<RoomState | null>(null)
  const [stories, setStories] = useState<Array<Story>>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStoriesLoading, setIsStoriesLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const reconnectAttempt = useRef(0)
  const debounceRef = useRef<number | null>(null)
  const pendingEventsRef = useRef<Set<RoomRealtimeEvent["type"]>>(new Set())
  const socketRef = useRef<WebSocket | null>(null)
  const fallbackPollRef = useRef<number | null>(null)

  const refreshState = useCallback(async () => {
    const next = await fetchRoomState(roomId)
    setState(next)
    setError(null)
    return next
  }, [roomId])

  const refreshStories = useCallback(async () => {
    if (!loadStories) return []
    setIsStoriesLoading(true)
    try {
      const next = await fetchStories(roomId)
      setStories(next)
      setError(null)
      return next
    } finally {
      setIsStoriesLoading(false)
    }
  }, [loadStories, roomId])

  const refresh = useCallback(async () => {
    const [nextState] = await Promise.all([
      refreshState(),
      loadStories ? refreshStories() : Promise.resolve([]),
    ])
    return nextState
  }, [loadStories, refreshState, refreshStories])

  const scheduleRefresh = useCallback(
    (event: RoomRealtimeEvent) => {
      pendingEventsRef.current.add(event.type)

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }

      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null
        const pending = pendingEventsRef.current
        pendingEventsRef.current = new Set()

        const shouldRefreshRoomState =
          pending.has("room:updated") ||
          pending.has("participants:updated") ||
          pending.has("voting:revealed")

        if (shouldRefreshRoomState) {
          void refreshState().catch((err) => {
            setError(
              err instanceof Error ? err.message : "Failed to load room state"
            )
          })
        }

        if (
          (pending.has("stories:updated") || pending.has("voting:revealed")) &&
          loadStories
        ) {
          void refreshStories().catch((err) => {
            setError(
              err instanceof Error ? err.message : "Failed to load stories"
            )
          })
        }
      }, debounceMs)
    },
    [loadStories, refreshState, refreshStories]
  )

  useEffect(() => {
    if (!enabled || !loadStories) return
    void refreshStories()
  }, [enabled, loadStories, refreshStories])

  const clearFallbackPoll = useCallback(() => {
    if (fallbackPollRef.current) {
      window.clearInterval(fallbackPollRef.current)
      fallbackPollRef.current = null
    }
  }, [])

  const startFallbackPoll = useCallback(() => {
    clearFallbackPoll()
    fallbackPollRef.current = window.setInterval(() => {
      void refresh().catch(() => undefined)
    }, fallbackPollMs)
  }, [clearFallbackPoll, refresh])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    void (async () => {
      try {
        await refresh()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load room")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, refresh])

  useEffect(() => {
    if (!enabled) return

    let reconnectTimeout: number | null = null

    function connect() {
      const socket = new WebSocket(roomWebSocketUrl(roomId))
      socketRef.current = socket

      socket.addEventListener("open", () => {
        reconnectAttempt.current = 0
        setIsConnected(true)
        clearFallbackPoll()
      })

      socket.addEventListener("message", (message) => {
        if (typeof message.data !== "string") return
        const event = parseRoomRealtimeEvent(message.data)
        if (!event) return

        if (isIncrementalRoomEvent(event)) {
          const isOwnVoteEvent =
            participantId != null &&
            (event.type === "vote:cast" || event.type === "vote:cleared") &&
            event.participantId === participantId

          if (!isOwnVoteEvent) {
            setState((current) =>
              current
                ? applyRoomRealtimeEvent(current, event, participantId)
                : current
            )
          }

          if (event.type === "voting:started" && loadStories) {
            void refreshStories().catch((err) => {
              setError(
                err instanceof Error ? err.message : "Failed to load stories"
              )
            })
          }
          return
        }

        scheduleRefresh(event)
      })

      socket.addEventListener("close", () => {
        setIsConnected(false)
        if (socketRef.current === socket) {
          socketRef.current = null
        }
        startFallbackPoll()

        const delay = Math.min(
          1000 * 2 ** reconnectAttempt.current,
          maxReconnectDelayMs
        )
        reconnectAttempt.current += 1
        reconnectTimeout = window.setTimeout(connect, delay)
      })

      socket.addEventListener("error", () => {
        socket.close()
      })
    }

    connect()

    return () => {
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout)
      }
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
      pendingEventsRef.current = new Set()
      clearFallbackPoll()
      socketRef.current?.close()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [
    clearFallbackPoll,
    enabled,
    loadStories,
    participantId,
    refreshStories,
    roomId,
    scheduleRefresh,
    startFallbackPoll,
  ])

  return {
    state,
    stories,
    error,
    isLoading,
    isStoriesLoading,
    isConnected,
    refresh,
    refreshState,
    refreshStories,
    setState,
    setStories,
  }
}
