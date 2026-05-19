import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"

import { JoinRoomDialog } from "@/components/join-room-dialog"
import { RoomPreview } from "@/components/room/room-preview"
import { RoomShell } from "@/components/room/room-shell"
import { fetchMyParticipant } from '@/lib/api/participants';
import type { Participant } from '@/lib/api/participants';
import { fetchRoom } from '@/lib/api/rooms';
import type { RoomWithRelations } from '@/lib/api/rooms';
import { Spinner } from "@pointly/ui/components/spinner"

export const Route = createFileRoute("/rooms/$roomId")({
  component: RoomPage,
  head: () => ({
    meta: [{ title: "Room — Pointly" }],
  }),
})

function RoomPage() {
  const { roomId } = Route.useParams()
  const [room, setRoom] = useState<RoomWithRelations | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const roomData = await fetchRoom(roomId)
      setRoom(roomData)

      const me = await fetchMyParticipant(roomId)
      setParticipant(me)
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load room"
      )
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    void load()
  }, [load])

  const needsJoin = !isLoading && !loadError && room && !participant

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center py-32">
        <Spinner className="size-8" />
      </main>
    )
  }

  if (loadError || !room) {
    return (
      <main className="mx-auto flex flex-1 max-w-lg flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Room unavailable</h1>
        <p className="text-muted-foreground text-sm">{loadError ?? "Room not found"}</p>
      </main>
    )
  }

  return (
    <>
      <div
        className={needsJoin ? "pointer-events-none flex min-h-svh flex-col opacity-40 blur-[2px]" : "flex min-h-svh flex-col"}
        aria-hidden={needsJoin || undefined}
      >
        {participant ?
          <RoomShell
            room={room}
            participant={participant}
            onRoomChange={setRoom}
            onParticipantChange={setParticipant}
          />
        : <RoomPreview room={room} />}
      </div>

      {needsJoin ? (
        <JoinRoomDialog
          roomId={roomId}
          open
          onJoined={(joined) => {
            setParticipant(joined)
            void load()
          }}
        />
      ) : null}
    </>
  )
}
