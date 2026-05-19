import { useNavigate } from "@tanstack/react-router"
import {
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  Pencil,
  Shield,
  Sun,
  UserPlus,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@lonik/themer"

import { authClient } from "@/lib/auth-client"
import { updateMyParticipant } from "@/lib/api/participants"
import type { Participant } from "@/lib/api/participants"
import { participantInitial } from "@/lib/room/utils"
import { Avatar, AvatarFallback } from "@pointly/ui/components/avatar"
import { Button } from "@pointly/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pointly/ui/components/dropdown-menu"
type RoomUserMenuProps = {
  roomId: string
  participant: Participant
  onParticipantChange: (participant: Participant) => void
}

export function RoomUserMenu({
  roomId,
  participant,
  onParticipantChange,
}: RoomUserMenuProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [isUpdating, setIsUpdating] = useState(false)

  async function toggleSpectator(checked: boolean) {
    setIsUpdating(true)
    try {
      const updated = await updateMyParticipant(roomId, {
        isSpectator: checked,
      })
      onParticipantChange(updated)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: "/" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="max-w-48 gap-2 pr-2 pl-1.5">
            <Avatar size="sm">
              <AvatarFallback>
                {participantInitial(participant.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{participant.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar size="lg">
              <AvatarFallback>
                {participantInitial(participant.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-medium">
                {participant.name}
                <Pencil className="text-muted-foreground opacity-50" />
              </p>
              <p className="text-xs text-muted-foreground">Guest user</p>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={participant.isSpectator}
          disabled={isUpdating}
          onCheckedChange={(checked) => void toggleSpectator(checked === true)}
        >
          Spectator mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Moon data-icon="inline-start" />
          Appearance
          <span className="ml-auto text-xs text-muted-foreground">
            {theme === "dark" ? <Sun /> : <Moon />}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogIn data-icon="inline-start" />
          Login
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <UserPlus data-icon="inline-start" />
          Sign up
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <MessageCircle data-icon="inline-start" />
          Contact us
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Shield data-icon="inline-start" />
          Legal notice
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void handleSignOut()}
        >
          <LogOut data-icon="inline-start" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
