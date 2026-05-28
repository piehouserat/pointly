import { useRef, useState } from "react"

import { InvitePlayersDialog } from "@/components/room/invite-players-dialog"
import { RoomCardDeck } from "@/components/room/room-card-deck"
import { RoomHeader } from "@/components/room/room-header"
import { RoomTable } from "@/components/room/room-table"
import { RoomTimerExpiredAlert } from "@/components/room/room-timer-expired-alert"
import { RoomTimerProvider } from "@/components/room/room-timer-context"
import { VotingResults } from "@/components/room/voting-results"
import { useRoomState } from "@/hooks/use-room-state"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { Spinner } from "@pointly/ui/components/spinner"

type RoomShellProps = {
  room: RoomWithRelations
  participant: Participant
  onRoomChange: (room: RoomWithRelations) => void
  onParticipantChange: (participant: Participant) => void
}

export function RoomShell({
  room,
  participant,
  onRoomChange,
  onParticipantChange,
}: RoomShellProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [isRevealCountdown, setIsRevealCountdown] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const { state, isLoading, refresh } = useRoomState(room.id)

  if (isLoading || !state) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Spinner className="size-8" />
      </div>
    )
  }

  const isRevealed = state.activeStory?.status === "revealed"

  return (
    <RoomTimerProvider
      roomId={room.id}
      activeStoryId={state.activeStory?.id ?? null}
    >
      <div className="flex min-h-svh flex-col">
        <InvitePlayersDialog
          roomId={room.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
        <RoomTimerExpiredAlert />
        <RoomHeader
          room={room}
          participant={participant}
          onRoomChange={onRoomChange}
          onParticipantChange={onParticipantChange}
          onInviteClick={() => setInviteOpen(true)}
        />
        <RoomTable
          roomState={state}
          currentParticipant={participant}
          onInviteClick={() => setInviteOpen(true)}
          onStateChange={() => void refresh()}
          onFocusDeck={() => deckRef.current?.scrollIntoView({ behavior: "smooth" })}
          onRevealCountdownChange={setIsRevealCountdown}
        />
        {isRevealed && state.activeStory ?
          <VotingResults
            votes={state.activeStory.votes}
            showAverage={state.room.showAverage}
          />
        : !isRevealCountdown ?
          <RoomCardDeck
            roomState={state}
            participant={participant}
            onStateChange={() => void refresh()}
            deckRef={deckRef}
          />
        : null}
      </div>
    </RoomTimerProvider>
  )
}
