import { Link } from "@tanstack/react-router"
import { PanelRight, UserPlus } from "lucide-react"

import { RoomGameMenu } from "@/components/room/room-game-menu"
import { RoomTimerPopover } from "@/components/room/room-timer-popover"
import { RoomUserMenu } from "@/components/room/room-user-menu"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { Button } from "@pointly/ui/components/button"

type RoomHeaderProps = {
  room: RoomWithRelations
  participant: Participant
  onRoomChange: (room: RoomWithRelations) => void
  onParticipantChange: (participant: Participant) => void
  onInviteClick: () => void
}

export function RoomHeader({
  room,
  participant,
  onRoomChange,
  onParticipantChange,
  onInviteClick,
}: RoomHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4 sm:px-6">
      <Link to="/" className="shrink-0">
        <img
          src="/pointly-logo-primary.svg"
          alt="Pointly"
          className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
        />
      </Link>

      <RoomGameMenu
        room={room}
        participant={participant}
        onRoomChange={onRoomChange}
      />

      <div className="ml-auto flex items-center gap-2">
        <RoomTimerPopover />

        <RoomUserMenu
          roomId={room.id}
          participant={participant}
          onParticipantChange={onParticipantChange}
        />

        <Button variant="outline" onClick={onInviteClick}>
          <UserPlus data-icon="inline-start" />
          Invite players
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Sidebar (coming soon)"
        >
          <PanelRight />
        </Button>
      </div>
    </header>
  )
}
