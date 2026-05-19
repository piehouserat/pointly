import { Frown, Meh, Smile } from "lucide-react"

import type { VoteView } from "@/lib/api/room-state"
import {
  computeVoteStats,
  getAgreementLevel,
  getVoteShare,
} from "@/lib/room/vote-stats"
import type { AgreementLevel } from "@/lib/room/vote-stats"
import { cn } from "@pointly/ui/lib/utils"

type VotingResultsProps = {
  votes: Array<VoteView>
  showAverage: boolean
}

const BAR_MAX_PX = 88

const agreementRingStroke: Record<AgreementLevel, string> = {
  high: "stroke-primary",
  medium: "stroke-amber-500",
  low: "stroke-destructive",
}

const agreementIconClass: Record<AgreementLevel, string> = {
  high: "text-primary",
  medium: "text-amber-500",
  low: "text-destructive",
}

function AgreementIcon({ level }: { level: AgreementLevel }) {
  const className = cn("size-9", agreementIconClass[level])
  if (level === "high") return <Smile className={className} aria-hidden />
  if (level === "medium") return <Meh className={className} aria-hidden />
  return <Frown className={className} aria-hidden />
}

function AgreementRing({
  percent,
  level,
}: {
  percent: number
  level: AgreementLevel
}) {
  const size = 96
  const strokeWidth = 9
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (percent / 100) * circumference

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn(
            "transition-[stroke-dashoffset]",
            agreementRingStroke[level]
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AgreementIcon level={level} />
      </div>
    </div>
  )
}

function VoteShareBar({
  count,
  totalVotes,
}: {
  count: number
  totalVotes: number
}) {
  const fillHeight = getVoteShare(count, totalVotes) * BAR_MAX_PX

  return (
    <div
      className="relative flex w-1.5 justify-center"
      style={{ height: BAR_MAX_PX }}
    >
      <div className="absolute inset-y-0 w-full rounded-full bg-muted" />
      <div
        className="absolute bottom-0 w-full rounded-full bg-foreground"
        style={{ height: fillHeight }}
      />
    </div>
  )
}

export function VotingResults({ votes, showAverage }: VotingResultsProps) {
  const { average, agreementPercent, distribution, totalVotes } =
    computeVoteStats(votes)

  if (distribution.length === 0) {
    return null
  }

  const agreementLevel =
    agreementPercent != null ? getAgreementLevel(agreementPercent) : null

  const formattedAverage =
    average != null
      ? Number.isInteger(average)
        ? String(average)
        : average.toFixed(1)
      : null

  return (
    <section className="shrink-0 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-10 sm:flex-row sm:items-end sm:gap-16">
        <ul className="flex items-end justify-center gap-6 sm:gap-10">
          {distribution.map((item) => (
            <li key={item.value} className="flex flex-col items-center gap-2">
              <div
                className="flex w-11 flex-col items-center justify-end gap-1"
                style={{ height: BAR_MAX_PX + 48 }}
              >
                <VoteShareBar count={item.count} totalVotes={totalVotes} />
                <div className="flex h-11 w-10 items-center justify-center rounded-lg border-2 border-foreground/80 bg-card text-base font-semibold text-foreground">
                  {item.value}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.count} Vote{item.count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-8">
          {showAverage && formattedAverage != null ? (
            <div className="flex flex-col items-center text-center">
              <p className="text-base text-muted-foreground">Average:</p>
              <p className="text-5xl font-bold tracking-tight tabular-nums">
                {formattedAverage}
              </p>
            </div>
          ) : null}

          {agreementPercent != null && agreementLevel != null ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-base text-muted-foreground">Agreement:</p>
              <AgreementRing
                percent={agreementPercent}
                level={agreementLevel}
              />
              <p className="sr-only">{agreementPercent}% agreement</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
