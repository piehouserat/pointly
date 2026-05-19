import { apiFetch } from "@/lib/api/client"

export type Participant = {
  id: string
  roomId: string
  userId: string
  name: string
  isHost: boolean
  isSpectator: boolean
  joinedAt: string
}

export async function fetchMyParticipant(
  roomId: string
): Promise<Participant | null> {
  const response = await apiFetch(`/rooms/${roomId}/participants/me`)

  if (response.status === 401 || response.status === 404) {
    return null
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to load participant")
  }

  return response.json() as Promise<Participant>
}

export async function joinRoom(input: {
  roomId: string
  name: string
  isSpectator: boolean
}): Promise<Participant> {
  const response = await apiFetch(`/rooms/${input.roomId}/participants`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      isSpectator: input.isSpectator,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to join room")
  }

  return response.json() as Promise<Participant>
}

export async function updateMyParticipant(
  roomId: string,
  input: { name?: string; isSpectator?: boolean }
): Promise<Participant> {
  const response = await apiFetch(`/rooms/${roomId}/participants/me`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to update participant")
  }

  return response.json() as Promise<Participant>
}
