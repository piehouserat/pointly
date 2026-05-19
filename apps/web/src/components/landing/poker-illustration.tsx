import { Coffee, HelpCircle, User } from "lucide-react"

import { cn } from "@pointly/ui/lib/utils"

const participants = [
  { name: "Sara", angle: -130, distance: 42 },
  { name: "Michael", angle: -55, distance: 44 },
  { name: "Jennifer", angle: 35, distance: 44 },
  { name: "Alex", angle: 115, distance: 42 },
  { name: "Priya", angle: 175, distance: 38 },
] as const

const deckValues = ["0", "1", "2", "3", "5", "8", "13"] as const

export function PokerIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-4/3 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6",
        className
      )}
      aria-hidden
    >
      <div className="relative mx-auto aspect-square w-full max-w-[280px]">
        {participants.map((participant) => {
          const radians = (participant.angle * Math.PI) / 180
          const x = 50 + Math.cos(radians) * participant.distance
          const y = 50 + Math.sin(radians) * participant.distance

          return (
            <div
              key={participant.name}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card">
                <User className="size-4" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{participant.name}</span>
              <div className="h-7 w-5 rounded-sm border border-border bg-muted shadow-sm" />
            </div>
          )
        })}

        <div className="absolute top-1/2 left-1/2 flex w-[58%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-xl bg-primary/10 px-4 py-5">
          <div className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
            Reveal cards
          </div>
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
