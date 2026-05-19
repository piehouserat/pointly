import { Link } from "@tanstack/react-router"
import { Users } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { Button } from "@pointly/ui/components/button"
import { cn } from "@pointly/ui/lib/utils"

const FIBONACCI_DECK = ["0", "½", "1", "2", "3", "5", "8", "13", "21", "?", "☕"]

type RoomShellProps = {
  room: RoomWithRelations
  participant: Participant
}

export function RoomShell({ room, participant }: RoomShellProps) {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="shrink-0">
            <img
              src="/pointly-logo-primary.svg"
              alt="Pointly"
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold sm:text-base">{room.name}</h1>
            <p className="text-muted-foreground truncate text-xs">
              {participant.isSpectator ? "Spectating" : "Playing"} as {participant.name}
              {participant.isHost ? " · Host" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:inline-flex">
              <Users className="size-3.5" />
              {room.participants.length}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-muted-foreground max-w-md text-sm">
            Pick a card when voting starts. Story management and live sync are coming next.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {FIBONACCI_DECK.map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="lg"
                disabled={participant.isSpectator}
                className={cn(
                  "h-14 w-14 rounded-xl text-base font-semibold sm:h-16 sm:w-16",
                  participant.isSpectator && "opacity-50"
                )}
              >
                {value}
              </Button>
            ))}
          </div>
        </section>

        {room.participants.length > 0 ? (
          <section className="mx-auto w-full max-w-lg">
            <h2 className="text-muted-foreground mb-3 text-center text-xs font-medium tracking-wide uppercase">
              In this room
            </h2>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {room.participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {p.isHost ? "Host" : p.isSpectator ? "Spectator" : "Player"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  )
}
