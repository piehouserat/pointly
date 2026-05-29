import { Link } from "@tanstack/react-router"
import { PanelRight, UserPlus } from "lucide-react"

import { RoomGameMenu } from "@/components/room/room-game-menu"
import { RoomTimerPopover } from "@/components/room/room-timer-popover"
import { UserMenu } from "@/components/user-menu"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { Button } from "@pointly/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@pointly/ui/components/tooltip"
import { cn } from "@pointly/ui/lib/utils"

type RoomHeaderProps = {
  room: RoomWithRelations
  participant: Participant
  sidebarOpen: boolean
  onSidebarToggle: () => void
  onRoomChange: (room: RoomWithRelations) => void
  onParticipantChange: (participant: Participant) => void
  onRefreshRoomState: () => void | Promise<void>
  onInviteClick: () => void
}

export function RoomHeader({
  room,
  participant,
  sidebarOpen,
  onSidebarToggle,
  onRoomChange,
  onParticipantChange,
  onRefreshRoomState,
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

        <UserMenu
          roomId={room.id}
          participant={participant}
          onParticipantChange={onParticipantChange}
          onRefreshRoomState={onRefreshRoomState}
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" onClick={onInviteClick}>
                <UserPlus />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={6}>
            Invite players
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Stories sidebar"
                aria-expanded={sidebarOpen}
                className={cn(sidebarOpen && "bg-muted text-foreground")}
                onClick={onSidebarToggle}
              >
                <PanelRight />
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={6}>
            Stories
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
