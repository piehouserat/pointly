import { useNavigate } from "@tanstack/react-router"
import {
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Pencil,
  Sun,
  SunMoon,
  UserPlus,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@lonik/themer"

import { useAuthDialog } from "@/components/auth/auth-dialog-provider"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { updateMyParticipant } from "@/lib/api/participants"
import type { Participant } from "@/lib/api/participants"
import { authClient } from "@/lib/auth-client"
import { authCallbackUrl } from "@/lib/auth-callback-url"
import {
  getUserMenuTriggerLabel,
  userMenuInitial,
} from "@/lib/user-display-name"
import { Avatar, AvatarFallback } from "@pointly/ui/components/avatar"
import { Button } from "@pointly/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@pointly/ui/components/dropdown-menu"
import { Switch } from "@pointly/ui/components/switch"
import { Spinner } from "@pointly/ui/components/spinner"

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

type ThemeValue = (typeof themeOptions)[number]["value"]

type UserMenuProps = {
  roomId?: string
  participant?: Participant
  onParticipantChange?: (participant: Participant) => void
  onRefreshRoomState?: () => void | Promise<void>
}

export function UserMenu({
  roomId,
  participant,
  onParticipantChange,
  onRefreshRoomState,
}: UserMenuProps) {
  const navigate = useNavigate()
  const { openLogin, openSignup } = useAuthDialog()
  const session = authClient.useSession()
  const { theme, setTheme } = useTheme()
  const currentTheme: ThemeValue = themeOptions.some(
    (option) => option.value === theme
  )
    ? (theme as ThemeValue)
    : "system"
  const [isUpdating, setIsUpdating] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  const user = session.data?.user
  const isGuest = !user || user.isAnonymous !== false
  const menuLabel = getUserMenuTriggerLabel(user, participant)
  const menuInitial = userMenuInitial(menuLabel)
  const subtitle = isGuest
    ? "Guest user"
    : user.email !== menuLabel
      ? user.email
      : "Signed in"

  async function toggleSpectator(checked: boolean) {
    if (!roomId || !onParticipantChange) return

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

  if (session.isPending) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Loading account">
        <Spinner className="size-4" />
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="max-w-48 gap-2 pr-2 pl-1.5">
            <Avatar size="sm">
              <AvatarFallback>{menuInitial}</AvatarFallback>
            </Avatar>
            <span className="truncate">{menuLabel}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar size="lg">
              <AvatarFallback>{menuInitial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{menuLabel}</p>
              <p className="truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {participant && roomId && onParticipantChange ? (
          <>
            <DropdownMenuItem
              disabled={isUpdating}
              closeOnClick={false}
              className="justify-between"
              onClick={() =>
                void toggleSpectator(!participant.isSpectator)
              }
            >
              Spectator mode
              <Switch
                size="sm"
                checked={participant.isSpectator}
                disabled={isUpdating}
                tabIndex={-1}
                aria-hidden
                className="pointer-events-none"
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon data-icon="inline-start" />
            Appearance
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={currentTheme}
              onValueChange={(value) => {
                if (value) {
                  setTheme(value as ThemeValue)
                }
              }}
            >
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <option.icon data-icon="inline-start" />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {isGuest ?
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openLogin({ callbackURL: authCallbackUrl() })}
            >
              <LogIn data-icon="inline-start" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openSignup({ callbackURL: authCallbackUrl() })}
            >
              <UserPlus data-icon="inline-start" />
              Sign up
            </DropdownMenuItem>
          </>
        : <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditProfileOpen(true)}>
              <Pencil data-icon="inline-start" />
              Edit profile
            </DropdownMenuItem>
          </>}
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
    {!isGuest && user ?
      <EditProfileDialog
        open={editProfileOpen}
        initialName={user.name}
        onOpenChange={setEditProfileOpen}
        onSaved={async (name) => {
          await session.refetch()
          if (roomId && onParticipantChange) {
            const updated = await updateMyParticipant(roomId, { name })
            onParticipantChange(updated)
          }
          await onRefreshRoomState?.()
        }}
      />
    : null}
    </>
  )
}
