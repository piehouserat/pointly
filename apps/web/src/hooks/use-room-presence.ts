import { useRouterState } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

import { leaveRoomNow } from "@/lib/room/disconnect-leave"

function isRoomPath(pathname: string, roomId: string) {
  return pathname === `/rooms/${roomId}`
}

/** Leaves immediately when navigating away in-app. Tab close is handled server-side via WS disconnect. */
export function useRoomPresence(roomId: string, enabled: boolean) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const inRoom = isRoomPath(pathname, roomId)
  const wasInRoomRef = useRef(inRoom)

  useEffect(() => {
    if (!enabled) return

    const wasInRoom = wasInRoomRef.current
    wasInRoomRef.current = inRoom

    if (wasInRoom && !inRoom) {
      void leaveRoomNow(roomId).catch(() => undefined)
    }
  }, [enabled, inRoom, roomId])
}
