import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { participantInitial } from "@/lib/room/utils"
import { cn } from "@pointly/ui/lib/utils"

type RoomTableProps = {
  room: RoomWithRelations
  currentParticipant: Participant
  onInviteClick: () => void
}

export function RoomTable({
  room,
  currentParticipant,
  onInviteClick,
}: RoomTableProps) {
  const isLonely = room.participants.length <= 1

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-6">
      {isLonely ? (
        <p className="text-muted-foreground text-sm">
          Feeling lonely?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={onInviteClick}
          >
            Invite players
          </button>
        </p>
      ) : null}

      <div
        className={cn(
          "flex w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 px-8 py-16 text-center shadow-sm",
          "min-h-48 sm:min-h-56"
        )}
      >
        <p className="text-lg font-medium text-primary sm:text-xl">Pick your cards!</p>
      </div>

      <ul className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
        {room.participants.map((p) => {
          const isMe = p.id === currentParticipant.id
          return (
            <li key={p.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-16 w-11 items-center justify-center rounded-lg border-2 bg-card shadow-sm",
                  isMe ? "border-primary" : "border-border"
                )}
                aria-hidden
              >
                <span className="text-muted-foreground text-xs font-medium">
                  {participantInitial(p.name)}
                </span>
              </div>
              <span
                className={cn(
                  "max-w-24 truncate text-xs font-medium",
                  isMe ? "text-primary" : "text-muted-foreground"
                )}
              >
                {p.name}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
