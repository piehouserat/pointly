import { Pencil } from "lucide-react"

import type { VoteView } from "@/lib/api/room-state"
import { cn } from "@pointly/ui/lib/utils"

type ParticipantVoteCardProps = {
  name: string
  vote: VoteView | undefined
  isMe: boolean
  isRevealed: boolean
  onChangeMyCard?: () => void
}

export function ParticipantVoteCard({
  name,
  vote,
  isMe,
  isRevealed,
  onChangeMyCard,
}: ParticipantVoteCardProps) {
  const hasVoted = vote?.hasVoted ?? false
  const showValue = isRevealed && vote?.value != null

  return (
    <li className="group flex flex-col items-center gap-2">
      <div className="relative">
        {isMe && hasVoted && !isRevealed && onChangeMyCard ?
          <button
            type="button"
            onClick={onChangeMyCard}
            className="absolute -top-2 -left-2 z-10 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
            title="Change my card"
          >
            <Pencil />
          </button>
        : null}

        <div
          className={cn(
            "relative flex h-[4.5rem] w-11 items-center justify-center overflow-hidden rounded-lg border-2 shadow-sm",
            isMe ? "border-primary" : "border-primary/60",
            showValue || hasVoted ? "bg-card" : "border-border bg-muted/30"
          )}
        >
          {showValue ?
            <span className="text-xl font-semibold text-primary">{vote!.value}</span>
          : hasVoted ?
            <span
              aria-hidden
              className="absolute inset-1 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary)_0_6px,transparent_6px_12px)] opacity-25"
            />
          : <span className="text-muted-foreground/40 text-xs">—</span>}
        </div>

        {isMe && hasVoted && !isRevealed ?
          <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 rounded-md bg-foreground/80 px-2 py-1 text-center text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
            Change my card
          </span>
        : null}
      </div>

      <span
        className={cn(
          "max-w-28 truncate text-sm font-semibold",
          isMe ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {name}
      </span>
    </li>
  )
}
