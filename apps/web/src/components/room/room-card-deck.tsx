import { useEffect, useState } from "react"
import { motion } from "motion/react"

import type { Participant } from "@/lib/api/participants"
import type { RoomState } from "@/lib/api/room-state"
import { castVote, clearMyVote } from "@/lib/api/room-state"
import { getDeckForRoom } from "@/lib/room/decks"
import { cn } from "@pointly/ui/lib/utils"

type RoomCardDeckProps = {
  roomState: RoomState
  participant: Participant
  onStateChange: () => void
  deckRef?: React.RefObject<HTMLDivElement | null>
}

export function RoomCardDeck({
  roomState,
  participant,
  onStateChange,
  deckRef,
}: RoomCardDeckProps) {
  const { room, activeStory } = roomState
  const deck = getDeckForRoom(room)
  const isVoting = activeStory?.status === "voting"
  const myVote = activeStory?.votes.find(
    (v) => v.participantId === participant.id
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [isCasting, setIsCasting] = useState(false)

  useEffect(() => {
    setSelected(myVote?.hasVoted ? (myVote.value ?? null) : null)
  }, [myVote?.hasVoted, myVote?.value, activeStory?.id])

  const disabled = participant.isSpectator || !isVoting

  async function handleCardClick(value: string) {
    if (disabled || !activeStory || isCasting) return

    const isClearing = selected === value && myVote?.hasVoted

    setIsCasting(true)
    try {
      if (isClearing) {
        setSelected(null)
        await clearMyVote(room.id, activeStory.id)
      } else {
        setSelected(value)
        await castVote(room.id, activeStory.id, value)
      }
      onStateChange()
    } catch {
      setSelected(myVote?.hasVoted ? (myVote.value ?? null) : null)
    } finally {
      setIsCasting(false)
    }
  }

  if (!isVoting) {
    return null
  }

  return (
    <section ref={deckRef} className="shrink-0 px-4 py-6 sm:px-6">
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Choose your card
      </p>
      <div className="flex flex-wrap items-end justify-center gap-2 pb-2 sm:gap-2.5">
        {deck.map((value) => {
          const isSelected = selected === value
          return (
            <motion.button
              key={value}
              type="button"
              disabled={disabled || isCasting}
              onClick={() => void handleCardClick(value)}
              layout
              initial={false}
              animate={{
                y: isSelected ? -10 : 0,
                scale: isSelected ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
              }}
              className={cn(
                "relative h-14 min-w-12 rounded-lg border-2 px-3 text-base font-semibold sm:h-16 sm:min-w-14",
                "bg-card text-foreground",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-primary/50 hover:border-primary hover:bg-muted/50"
              )}
            >
              {value}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
