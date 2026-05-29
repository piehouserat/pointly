import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type TimerStatus = "idle" | "running" | "paused" | "expired"

type RoomTimerContextValue = {
  minutes: number
  seconds: number
  resetEachRound: boolean
  status: TimerStatus
  remainingSeconds: number
  totalSeconds: number
  progress: number
  isActive: boolean
  setMinutes: (value: number) => void
  setSeconds: (value: number) => void
  setResetEachRound: (value: boolean) => void
  startOrPause: () => void
  restart: () => void
  addMinute: () => void
  cancel: () => void
  dismissExpired: () => void
}

const RoomTimerContext = createContext<RoomTimerContextValue | null>(null)

export function useRoomTimer() {
  const value = useContext(RoomTimerContext)
  if (!value) {
    throw new Error("useRoomTimer must be used within RoomTimerProvider")
  }
  return value
}

type RoomTimerProviderProps = {
  roomId: string
  activeStoryId?: string | null
  children: ReactNode
}

export function RoomTimerProvider({
  roomId,
  activeStoryId = null,
  children,
}: RoomTimerProviderProps) {
  const storageKey = `pointly-timer-${roomId}`
  const previousStoryId = useRef<string | null>(null)
  const [initialSettings] = useState(() => readStoredSettings(storageKey))

  const [minutes, setMinutes] = useState(initialSettings.minutes)
  const [seconds, setSeconds] = useState(initialSettings.seconds)
  const [resetEachRound, setResetEachRound] = useState(
    initialSettings.resetEachRound
  )
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    parseDuration(initialSettings.minutes, initialSettings.seconds)
  )
  const [totalSeconds, setTotalSeconds] = useState(() =>
    parseDuration(initialSettings.minutes, initialSettings.seconds)
  )

  const durationSeconds = parseDuration(minutes, seconds)
  const isActive = status === "running" || status === "paused"
  const progress =
    totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0

  const persistSettings = useCallback(
    (next: { minutes: number; seconds: number; resetEachRound: boolean }) => {
      if (typeof window === "undefined") return
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    },
    [storageKey]
  )

  const restart = useCallback(() => {
    const total = parseDuration(minutes, seconds)
    setRemainingSeconds(total)
    setTotalSeconds(total)
    setStatus(total > 0 ? "running" : "idle")
  }, [minutes, seconds])

  const addMinute = useCallback(() => {
    setRemainingSeconds((current) => clamp(current + 60, 0, 99 * 60 + 59))
    setTotalSeconds((current) => current + 60)
  }, [])

  const cancel = useCallback(() => {
    const total = parseDuration(minutes, seconds)
    setStatus("idle")
    setRemainingSeconds(total)
    setTotalSeconds(total)
  }, [minutes, seconds])

  const dismissExpired = useCallback(() => {
    setStatus("idle")
    setRemainingSeconds(0)
  }, [])

  useEffect(() => {
    persistSettings({ minutes, seconds, resetEachRound })
  }, [minutes, persistSettings, resetEachRound, seconds])

  useEffect(() => {
    if (status !== "running") return

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setStatus("expired")
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [status])

  useEffect(() => {
    if (!resetEachRound || !activeStoryId) {
      previousStoryId.current = activeStoryId
      return
    }

    if (
      previousStoryId.current &&
      previousStoryId.current !== activeStoryId &&
      isActive
    ) {
      restart()
    }

    previousStoryId.current = activeStoryId
  }, [activeStoryId, isActive, resetEachRound, restart])

  const startOrPause = useCallback(() => {
    if (status === "running") {
      setStatus("paused")
      return
    }

    if (status === "expired") {
      restart()
      return
    }

    const total =
      status === "paused" ? remainingSeconds : durationSeconds
    if (total <= 0) return

    setRemainingSeconds(total)
    setTotalSeconds(total)
    setStatus("running")
  }, [durationSeconds, remainingSeconds, restart, status])

  const value: RoomTimerContextValue = {
    minutes,
    seconds,
    resetEachRound,
    status,
    remainingSeconds,
    totalSeconds,
    progress,
    isActive,
    setMinutes,
    setSeconds,
    setResetEachRound,
    startOrPause,
    restart,
    addMinute,
    cancel,
    dismissExpired,
  }

  return (
    <RoomTimerContext.Provider value={value}>{children}</RoomTimerContext.Provider>
  )
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function parseDuration(minutes: number, seconds: number) {
  return clamp(minutes, 0, 99) * 60 + clamp(seconds, 0, 59)
}

export function splitDuration(totalSeconds: number) {
  const safeTotal = Math.max(0, totalSeconds)
  return {
    minutes: Math.floor(safeTotal / 60),
    seconds: safeTotal % 60,
  }
}

export function formatTwoDigits(value: number) {
  return String(Math.max(0, value)).padStart(2, "0")
}

export function formatRemainingTime(totalSeconds: number) {
  const { minutes, seconds } = splitDuration(totalSeconds)
  return `${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`
}

function readStoredSettings(storageKey: string) {
  const fallback = { minutes: 45, seconds: 0, resetEachRound: false }

  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<typeof fallback>
    return {
      minutes:
        typeof parsed.minutes === "number" ?
          clamp(parsed.minutes, 0, 99)
        : fallback.minutes,
      seconds:
        typeof parsed.seconds === "number" ?
          clamp(parsed.seconds, 0, 59)
        : fallback.seconds,
      resetEachRound:
        typeof parsed.resetEachRound === "boolean" ?
          parsed.resetEachRound
        : fallback.resetEachRound,
    }
  } catch {
    return fallback
  }
}
