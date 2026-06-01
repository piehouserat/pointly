import type { VoteView } from "@/lib/api/room-state"
import { cn } from "@pointly/ui/lib/utils"

type ParticipantVoteCardProps = {
  name: string
  vote: VoteView | undefined
  isMe: boolean
  isRevealed: boolean
}

export function ParticipantVoteCard({
  name,
  vote,
  isMe,
  isRevealed,
}: ParticipantVoteCardProps) {
  const hasVoted = vote?.hasVoted ?? false
  const showValue = isRevealed && vote?.value != null

  return (
    <li className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative flex h-[4.5rem] w-11 items-center justify-center overflow-hidden rounded-lg border-2 shadow-sm",
          isMe ? "border-primary" : "border-primary/60",
          showValue || hasVoted ? "bg-card" : "border-border bg-muted/30"
        )}
      >
        {showValue ? (
          <span className="text-xl font-semibold text-primary">
            {vote!.value}
          </span>
        ) : hasVoted ? (
          <span
            aria-hidden
            className="absolute inset-1 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary)_0_6px,transparent_6px_12px)] opacity-25"
          />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
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
