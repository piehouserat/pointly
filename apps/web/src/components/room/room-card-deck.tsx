import { useState } from "react"

import type { Participant } from "@/lib/api/participants"
import type { RoomWithRelations } from "@/lib/api/rooms"
import { getDeckForRoom } from "@/lib/room/decks"
import { Button } from "@pointly/ui/components/button"
import { cn } from "@pointly/ui/lib/utils"

type RoomCardDeckProps = {
  room: RoomWithRelations
  participant: Participant
}

export function RoomCardDeck({ room, participant }: RoomCardDeckProps) {
  const deck = getDeckForRoom(room)
  const [selected, setSelected] = useState<string | null>(null)
  const disabled = participant.isSpectator

  return (
    <section className="shrink-0 px-4 py-5 sm:px-6">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Choose your card 👇
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {deck.map((value) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => setSelected(value)}
            className={cn(
              "h-14 min-w-12 rounded-lg border-2 px-3 text-base font-semibold sm:h-16 sm:min-w-14",
              selected === value && "border-primary bg-primary/10 text-primary",
              disabled && "opacity-50"
            )}
          >
            {value}
          </Button>
        ))}
      </div>
    </section>
  )
}
