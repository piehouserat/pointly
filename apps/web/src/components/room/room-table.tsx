import { useState } from "react"
import { AnimatePresence } from "motion/react"

import { ParticipantVoteCard } from "@/components/room/participant-vote-card"
import {
  RevealCountdown,
  runRevealCountdown,
} from "@/components/room/reveal-countdown"
import type { Participant } from "@/lib/api/participants"
import type { ActiveStory, RoomState } from "@/lib/api/room-state"
import { revealCards, startVoting } from "@/lib/api/room-state"
import { Button } from "@pointly/ui/components/button"
import { Spinner } from "@pointly/ui/components/spinner"
import { cn } from "@pointly/ui/lib/utils"

type RoomTableProps = {
  roomState: RoomState
  currentParticipant: Participant
  onInviteClick: () => void
  onStateChange: () => void
  onFocusDeck?: () => void
  onRevealCountdownChange?: (active: boolean) => void
}

function voteByParticipant(story: ActiveStory | null, participantId: string) {
  return story?.votes.find((v) => v.participantId === participantId)
}

export function RoomTable({
  roomState,
  currentParticipant,
  onInviteClick,
  onStateChange,
  onFocusDeck,
  onRevealCountdownChange,
}: RoomTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const { room, participants, activeStory, canReveal } = roomState
  const voters = participants.filter((p) => !p.isSpectator)
  const isLonely = voters.length <= 1
  const isRevealed = activeStory?.status === "revealed"
  const isVoting = activeStory?.status === "voting"
  const isCountingDown = countdown !== null
  const splitIndex = Math.ceil(voters.length / 2)
  const topVoters = voters.slice(0, splitIndex)
  const bottomVoters = voters.slice(splitIndex)

  async function handleStartVoting() {
    setIsSubmitting(true)
    setActionError(null)
    try {
      await startVoting(room.id)
      onStateChange()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to start voting"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReveal() {
    setIsSubmitting(true)
    setActionError(null)
    try {
      if (room.showCountdown) {
        onRevealCountdownChange?.(true)
        await runRevealCountdown((value) => {
          setCountdown(value > 0 ? value : null)
        })
        setCountdown(null)
        onRevealCountdownChange?.(false)
      }

      await revealCards(room.id)
      onStateChange()
    } catch (error) {
      setCountdown(null)
      onRevealCountdownChange?.(false)
      setActionError(
        error instanceof Error ? error.message : "Failed to reveal cards"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderVotersRow(voterList: typeof voters) {
    return (
      <ul className="flex flex-wrap items-end justify-center gap-8 sm:gap-12">
        {voterList.map((p) => (
          <ParticipantVoteCard
            key={p.id}
            name={p.name}
            vote={voteByParticipant(activeStory, p.id)}
            isMe={p.id === currentParticipant.id}
            isRevealed={isRevealed}
            onChangeMyCard={
              p.id === currentParticipant.id && isVoting && !isCountingDown
                ? onFocusDeck
                : undefined
            }
          />
        ))}
      </ul>
    )
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
      {isLonely && !isVoting && !isRevealed ? (
        <p className="text-sm text-muted-foreground">
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

      {topVoters.length > 0 ? renderVotersRow(topVoters) : null}

      <div
        className={cn(
          "relative flex min-h-36 w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-10 shadow-sm",
          "ring-4 ring-primary/10"
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-4",
            isCountingDown && "invisible"
          )}
        >
          {!activeStory ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                {currentParticipant.isHost
                  ? "Start a round when everyone has joined."
                  : "Waiting for the host to start voting."}
              </p>
              {currentParticipant.isHost ? (
                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => void handleStartVoting()}
                >
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  Start voting
                </Button>
              ) : null}
            </div>
          ) : isRevealed ? (
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                variant="default"
                disabled={isSubmitting || !currentParticipant.isHost}
                onClick={() => void handleStartVoting()}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Start new voting
              </Button>
              {!currentParticipant.isHost ? (
                <p className="text-xs text-muted-foreground">
                  Only the host can start a new round
                </p>
              ) : null}
            </div>
          ) : (
            <Button
              size="lg"
              disabled={isSubmitting || !canReveal || isCountingDown}
              onClick={() => void handleReveal()}
            >
              {isSubmitting && !isCountingDown ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Reveal cards
            </Button>
          )}
        </div>

        <AnimatePresence>
          {countdown !== null && countdown > 0 ? (
            <RevealCountdown value={countdown} />
          ) : null}
        </AnimatePresence>
      </div>

      {bottomVoters.length > 0 ? renderVotersRow(bottomVoters) : null}

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
    </section>
  )
}
