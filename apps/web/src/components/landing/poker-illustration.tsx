import { Coffee, HelpCircle, User } from "lucide-react"

import { cn } from "@pointly/ui/lib/utils"

const participants = {
  top: [{ name: "Sara" }, { name: "Michael" }],
  bottom: [{ name: "Priya" }, { name: "Alex" }],
  left: { name: "Jennifer" },
  right: { name: "Jordan" },
} as const

const deckValues = ["0", "1", "2", "3", "5", "8", "13"] as const

function ParticipantSeat({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card">
        <User className="size-4" />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">
        {name}
      </span>
      <div className="h-7 w-5 rounded-sm border border-border bg-muted shadow-sm" />
    </div>
  )
}

export function PokerIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-4/3 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6",
        className
      )}
      aria-hidden
    >
      <div className="relative mx-auto flex aspect-square w-full max-w-[280px] flex-col">
        <div className="flex justify-center gap-12 sm:gap-16">
          {participants.top.map((participant) => (
            <ParticipantSeat key={participant.name} name={participant.name} />
          ))}
        </div>

        <div className="flex flex-1 items-center justify-between px-2">
          <ParticipantSeat name={participants.left.name} />

          <div className="flex w-[58%] flex-col items-center gap-3 rounded-xl bg-primary/10 px-4 py-5">
            <div className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
              Reveal cards
            </div>
          </div>

          <ParticipantSeat name={participants.right.name} />
        </div>

        <div className="flex justify-center gap-12 sm:gap-16">
          {participants.bottom.map((participant) => (
            <ParticipantSeat key={participant.name} name={participant.name} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {deckValues.map((value) => (
          <div
            key={value}
            className="flex h-12 w-8 items-center justify-center rounded-md border-2 border-primary bg-card text-xs font-semibold text-primary sm:h-14 sm:w-9 sm:text-sm"
          >
            {value}
          </div>
        ))}
        <div className="flex h-12 w-8 items-center justify-center rounded-md border-2 border-primary bg-card text-primary sm:h-14 sm:w-9">
          <HelpCircle className="size-4" />
        </div>
        <div className="flex h-12 w-8 items-center justify-center rounded-md border-2 border-primary bg-card text-primary sm:h-14 sm:w-9">
          <Coffee className="size-4" />
        </div>
      </div>
    </div>
  )
}
