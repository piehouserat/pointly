import { useCallback, useState } from "react"
import { AnimatePresence } from "motion/react"

import { InvitePlayersDialog } from "@/components/room/invite-players-dialog"
import { RoomCardDeck } from "@/components/room/room-card-deck"
import { RoomHeader } from "@/components/room/room-header"
import { RoomStoriesSidebar } from "@/components/room/room-stories-sidebar"
import { RoomTable } from "@/components/room/room-table"
import { RoomTimerExpiredAlert } from "@/components/room/room-timer-expired-alert"
import { RoomTimerProvider } from "@/components/room/room-timer-context"
import { VotingResults } from "@/components/room/voting-results"
import { useRoomPresence } from "@/hooks/use-room-presence"
import { useRoomRealtime } from "@/hooks/use-room-realtime"
import { applyOwnVoteUpdate } from "@/lib/realtime/apply-event"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import {
  buildRoomWithRelations,
  patchRoomStateParticipant,
  patchRoomStateRoom,
  resolveParticipant,
} from "@/lib/room/room-view"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isRevealCountdown, setIsRevealCountdown] = useState(false)
  const { state, stories, error, isLoading, isStoriesLoading, refresh, setState } =
    useRoomRealtime(room.id, {
      loadStories: sidebarOpen,
      participantId: participant.id,
    })

  const handleRoomChange = useCallback(
    (next: RoomWithRelations) => {
      onRoomChange(next)
      setState((current) =>
        current ? patchRoomStateRoom(current, next) : current
      )
    },
    [onRoomChange, setState]
  )

  const handleParticipantChange = useCallback(
    (next: Participant) => {
      onParticipantChange(next)
      setState((current) =>
        current ? patchRoomStateParticipant(current, next) : current
      )
    },
    [onParticipantChange, setState]
  )

  useRoomPresence(room.id, true)

  if (isLoading || !state) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error && !state) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-32">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    )
  }

  const roomView = buildRoomWithRelations(state, stories)
  const currentParticipant = resolveParticipant(
    state.participants,
    participant.id,
    participant
  )
  const isRevealed = state.activeStory?.status === "revealed"

  return (
    <RoomTimerProvider
      roomId={roomView.id}
      activeStoryId={state.activeStory?.id ?? null}
    >
      <div className="flex min-h-svh overflow-hidden">
        <InvitePlayersDialog
          roomId={roomView.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <RoomTimerExpiredAlert />
          <RoomHeader
            room={roomView}
            participant={currentParticipant}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen((open) => !open)}
            onRoomChange={handleRoomChange}
            onParticipantChange={handleParticipantChange}
            onRefreshRoomState={() => void refresh()}
            onInviteClick={() => setInviteOpen(true)}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <RoomTable
              roomState={state}
              currentParticipant={currentParticipant}
              onInviteClick={() => setInviteOpen(true)}
              onStateChange={() => void refresh()}
              onRevealCountdownChange={setIsRevealCountdown}
            />
            {isRevealed && state.activeStory ? (
              <VotingResults
                votes={state.activeStory.votes}
                showAverage={roomView.showAverage}
              />
            ) : !isRevealCountdown ? (
              <RoomCardDeck
                roomState={state}
                participant={currentParticipant}
                onVoteChange={(storyId, vote) => {
                  setState((current) =>
                    current ? applyOwnVoteUpdate(current, storyId, vote) : current
                  )
                }}
              />
            ) : null}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {sidebarOpen ? (
            <RoomStoriesSidebar
              key="room-stories-sidebar"
              room={roomView}
              participant={currentParticipant}
              stories={stories}
              isLoading={isStoriesLoading}
              error={error}
              onClose={() => setSidebarOpen(false)}
              onStoriesChange={() => void refresh()}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </RoomTimerProvider>
  )
}
