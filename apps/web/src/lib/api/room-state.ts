import type { Participant } from "@/lib/api/participants"
import type { Room } from "@/lib/schemas/room"
import { apiFetch } from "@/lib/api/client"

export type VoteView = {
  participantId: string
  hasVoted: boolean
  value: string | null
}

export type ActiveStory = {
  id: string
  title: string
  status: "pending" | "voting" | "revealed" | "skipped"
  finalEstimate: string | null
  votes: Array<VoteView>
}

export type RoomState = {
  room: Room
  participants: Array<Participant>
  activeStory: ActiveStory | null
  canReveal: boolean
}

export async function fetchRoomState(roomId: string): Promise<RoomState> {
  const response = await apiFetch(`/rooms/${roomId}/state`)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to load room state")
  }

  return response.json() as Promise<RoomState>
}

export async function startVoting(
  roomId: string,
  options?: { title?: string; storyId?: string }
): Promise<ActiveStory> {
  const response = await apiFetch(`/rooms/${roomId}/voting/start`, {
    method: "POST",
    body: JSON.stringify(options ?? {}),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to start voting")
  }

  const story = (await response.json()) as {
    id: string
    title: string
    status: ActiveStory["status"]
    finalEstimate: string | null
  }

  return {
    id: story.id,
    title: story.title,
    status: story.status,
    finalEstimate: story.finalEstimate,
    votes: [],
  }
}

export async function revealCards(roomId: string): Promise<void> {
  const response = await apiFetch(`/rooms/${roomId}/voting/reveal`, {
    method: "POST",
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to reveal cards")
  }
}

export async function castVote(
  roomId: string,
  storyId: string,
  value: string
): Promise<VoteView> {
  const response = await apiFetch(`/rooms/${roomId}/stories/${storyId}/votes`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to cast vote")
  }

  return response.json() as Promise<VoteView>
}
export async function clearMyVote(
  roomId: string,
  storyId: string
): Promise<void> {
  const response = await apiFetch(
    `/rooms/${roomId}/stories/${storyId}/votes/me`,
    { method: "DELETE" }
  )

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to clear vote")
  }
}
