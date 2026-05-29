import { apiFetch } from "@/lib/api/client"

export type StoryStatus = "pending" | "voting" | "revealed" | "skipped"

export type Story = {
  id: string
  roomId: string
  title: string
  description: string | null
  url: string | null
  status: StoryStatus
  finalEstimate: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export type CreateStoryInput = {
  title: string
  description?: string
  url?: string
  order?: number
}

export type UpdateStoryInput = {
  title?: string
  description?: string | null
  url?: string | null
  status?: StoryStatus
  finalEstimate?: string | null
  order?: number
}

export async function fetchStories(roomId: string): Promise<Array<Story>> {
  const response = await apiFetch(`/rooms/${roomId}/stories`)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to load stories")
  }

  return response.json() as Promise<Array<Story>>
}

export async function createStory(
  roomId: string,
  input: CreateStoryInput
): Promise<Story> {
  const response = await apiFetch(`/rooms/${roomId}/stories`, {
    method: "POST",
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to create story")
  }

  return response.json() as Promise<Story>
}

export async function updateStory(
  roomId: string,
  storyId: string,
  input: UpdateStoryInput
): Promise<Story> {
  const response = await apiFetch(`/rooms/${roomId}/stories/${storyId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to update story")
  }

  return response.json() as Promise<Story>
}

export async function deleteStory(
  roomId: string,
  storyId: string
): Promise<void> {
  const response = await apiFetch(`/rooms/${roomId}/stories/${storyId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to delete story")
  }
}

export function storyDisplayId(index: number) {
  return `PP-${index + 1}`
}

export function canManageStories(
  whoCanManageIssues: "all_players" | "host_only",
  participant: { isHost: boolean }
) {
  return whoCanManageIssues === "all_players" || participant.isHost
}
