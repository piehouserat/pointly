import type { Db, Participant, Story, Vote } from "@pointly/db"
import { participants as participantsTable, rooms, stories, votes } from "@pointly/db"
import { and, desc, eq, inArray } from "drizzle-orm"

export type VoteView = {
  participantId: string
  hasVoted: boolean
  value: string | null
}

export async function getActiveStory(db: Db, roomId: string) {
  const [story] = await db
    .select()
    .from(stories)
    .where(
      and(
        eq(stories.roomId, roomId),
        inArray(stories.status, ["voting", "revealed"])
      )
    )
    .orderBy(desc(stories.updatedAt))
    .limit(1)

  return story ?? null
}

export function mapVotesForParticipants(
  story: Story,
  participants: Array<Participant>,
  voteRows: Array<Vote>,
  currentParticipantId: string
): Array<VoteView> {
  const byParticipant = new Map(
    voteRows.map((vote) => [vote.participantId, vote])
  )

  return participants
    .filter((p) => !p.isSpectator)
    .map((participant) => {
      const vote = byParticipant.get(participant.id)
      if (!vote) {
        return {
          participantId: participant.id,
          hasVoted: false,
          value: null,
        }
      }
      return {
        participantId: participant.id,
        hasVoted: true,
        value: voteValueForClient(story, vote, currentParticipantId),
      }
    })
}

function voteValueForClient(
  story: Story,
  vote: Vote,
  currentParticipantId: string
) {
  if (story.status === "revealed") {
    return vote.value
  }
  if (vote.participantId === currentParticipantId) {
    return vote.value
  }
  return null
}

export function votingParticipants(participants: Array<Participant>) {
  return participants.filter((p) => !p.isSpectator)
}

export function allVotersHaveVoted(
  participants: Array<Participant>,
  voteRows: Array<Vote>
) {
  const voters = votingParticipants(participants)
  if (voters.length === 0) return false
  const votedIds = new Set(voteRows.map((v) => v.participantId))
  return voters.every((p) => votedIds.has(p.id))
}

export function computeFinalEstimate(voteValues: Array<string>) {
  if (voteValues.length === 0) return null

  const counts = new Map<string, number>()
  for (const value of voteValues) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let mode: string | null = null
  let maxCount = 0
  for (const [value, count] of counts) {
    if (count > maxCount) {
      mode = value
      maxCount = count
    }
  }

  return mode
}

export async function revealStory(db: Db, storyId: string) {
  const voteRows = await db
    .select()
    .from(votes)
    .where(eq(votes.storyId, storyId))

  const finalEstimate = computeFinalEstimate(voteRows.map((vote) => vote.value))

  const [story] = await db
    .update(stories)
    .set({ status: "revealed", finalEstimate, updatedAt: new Date() })
    .where(eq(stories.id, storyId))
    .returning()

  return story
}

export async function backfillStoryEstimates(db: Db, storyList: Array<Story>) {
  const missing = storyList.filter(
    (story) => story.status === "revealed" && story.finalEstimate == null
  )
  if (missing.length === 0) return storyList

  const voteRows = await db
    .select()
    .from(votes)
    .where(inArray(votes.storyId, missing.map((story) => story.id)))

  const votesByStory = new Map<string, Array<string>>()
  for (const vote of voteRows) {
    const current = votesByStory.get(vote.storyId) ?? []
    current.push(vote.value)
    votesByStory.set(vote.storyId, current)
  }

  const estimateByStoryId = new Map<string, string | null>()
  for (const story of missing) {
    estimateByStoryId.set(
      story.id,
      computeFinalEstimate(votesByStory.get(story.id) ?? [])
    )
  }

  await Promise.all(
    [...estimateByStoryId.entries()].map(([storyId, finalEstimate]) =>
      db
        .update(stories)
        .set({ finalEstimate, updatedAt: new Date() })
        .where(eq(stories.id, storyId))
    )
  )

  return storyList.map((story) => {
    const estimate = estimateByStoryId.get(story.id)
    if (estimate == null) return story
    return { ...story, finalEstimate: estimate }
  })
}

export function canReveal(
  room: { whoCanReveal: "all_players" | "host_only" },
  participant: Participant
) {
  if (room.whoCanReveal === "all_players") return true
  return participant.isHost
}

export async function maybeAutoReveal(
  db: Db,
  roomId: string,
  storyId: string
): Promise<boolean> {
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1)

  if (!room?.autoReveal) return false

  const roomParticipants = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.roomId, roomId))

  const voteRows = await db
    .select()
    .from(votes)
    .where(eq(votes.storyId, storyId))

  if (!allVotersHaveVoted(roomParticipants, voteRows)) return false

  await revealStory(db, storyId)
  return true
}
