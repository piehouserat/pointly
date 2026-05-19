import { Link } from "@tanstack/react-router"

import { RoomCardDeck } from "@/components/room/room-card-deck"
import { RoomTable } from "@/components/room/room-table"
import type { RoomWithRelations } from "@/lib/api/rooms"
import type { Participant } from "@/lib/api/participants"

const previewParticipant: Participant = {
  id: "preview",
  roomId: "",
  userId: "",
  name: "You",
  isHost: false,
  isSpectator: true,
  joinedAt: "",
}

type RoomPreviewProps = {
  room: RoomWithRelations
}

/** Static room chrome shown blurred behind the join dialog. */
export function RoomPreview({ room }: RoomPreviewProps) {
  const participant = { ...previewParticipant, roomId: room.id }

  return (
    <div className="flex min-h-svh flex-col" aria-hidden>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
        <Link to="/" className="shrink-0" tabIndex={-1}>
          <img
            src="/pointly-logo-primary.svg"
            alt=""
            className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
          />
        </Link>
        <span className="truncate font-semibold">{room.name}</span>
      </header>
      <RoomTable
        room={room}
        currentParticipant={participant}
        onInviteClick={() => {}}
      />
      <RoomCardDeck room={room} participant={participant} />
    </div>
  )
}
