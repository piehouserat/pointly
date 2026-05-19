import { ChevronDown, History, Settings } from "lucide-react"
import { useState } from "react"

import { Button } from "@pointly/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pointly/ui/components/dropdown-menu"
import { GameSettingsDialog } from "@/components/room/game-settings-dialog"
import { VotingHistoryDialog } from "@/components/room/voting-history-dialog"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"

type RoomGameMenuProps = {
  room: RoomWithRelations
  participant: Participant
  onRoomChange: (room: RoomWithRelations) => void
}

export function RoomGameMenu({
  room,
  participant,
  onRoomChange,
}: RoomGameMenuProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="max-w-56 gap-1 font-semibold">
              <span className="truncate">{room.name}</span>
              <ChevronDown />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings data-icon="inline-start" />
            Game settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
            <History data-icon="inline-start" />
            Voting history
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GameSettingsDialog
        room={room}
        participant={participant}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={onRoomChange}
      />
      <VotingHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  )
}
