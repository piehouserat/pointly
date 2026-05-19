import type { VoteView } from "@/lib/api/room-state"

const numericPattern = /^-?\d+(\.\d+)?$/

export function parseVoteNumber(value: string) {
  if (value === "½") return 0.5
  if (!numericPattern.test(value)) return null
  return Number(value)
}

export function computeVoteStats(votes: Array<VoteView>) {
  const revealed = votes.filter((v) => v.hasVoted && v.value != null)
  const counts = new Map<string, number>()

  for (const vote of revealed) {
    const key = vote.value!
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const numericValues = revealed
    .map((v) => parseVoteNumber(v.value!))
    .filter((n): n is number => n != null)

  const average =
    numericValues.length > 0 ?
      numericValues.reduce((sum, n) => sum + n, 0) / numericValues.length
    : null

  const distribution = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      const na = parseVoteNumber(a.value)
      const nb = parseVoteNumber(b.value)
      if (na != null && nb != null) return na - nb
      return a.value.localeCompare(b.value)
    })

  const maxCount = Math.max(0, ...distribution.map((d) => d.count))

  const agreementPercent = computeAgreementPercent(numericValues)
  const totalVotes = revealed.length

  return {
    average,
    agreementPercent,
    distribution,
    maxCount,
    totalVotes,
  }
}

/** 0–1: share of all votes that picked this value. */
export function getVoteShare(count: number, totalVotes: number) {
  if (totalVotes <= 0) return 0
  return count / totalVotes
}

/** 0–100: how closely numeric votes cluster around the average. */
export function computeAgreementPercent(numericValues: Array<number>) {
  if (numericValues.length === 0) return null
  if (numericValues.length === 1) return 100

  const average =
    numericValues.reduce((sum, n) => sum + n, 0) / numericValues.length

  const meanAbsDev =
    numericValues.reduce((sum, v) => sum + Math.abs(v - average), 0) /
    numericValues.length

  const scale = Math.max(average, 1)
  const relativeSpread = meanAbsDev / scale

  return Math.round(Math.max(0, Math.min(100, 100 * (1 - relativeSpread))))
}

export type AgreementLevel = "high" | "medium" | "low"

export function getAgreementLevel(percent: number): AgreementLevel {
  if (percent >= 75) return "high"
  if (percent >= 40) return "medium"
  return "low"
}
