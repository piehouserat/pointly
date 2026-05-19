import { useState } from "react"

import { InvitePlayersDialog } from "@/components/room/invite-players-dialog"
import { RoomCardDeck } from "@/components/room/room-card-deck"
import { RoomHeader } from "@/components/room/room-header"
import { RoomTable } from "@/components/room/room-table"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"

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

  return (
    <div className="flex min-h-svh flex-col">
      <InvitePlayersDialog
        roomId={room.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
      <RoomHeader
        room={room}
        participant={participant}
        onRoomChange={onRoomChange}
        onParticipantChange={onParticipantChange}
        onInviteClick={() => setInviteOpen(true)}
      />
      <RoomTable
        room={room}
        currentParticipant={participant}
        onInviteClick={() => setInviteOpen(true)}
      />
      <RoomCardDeck room={room} participant={participant} />
    </div>
  )
}
