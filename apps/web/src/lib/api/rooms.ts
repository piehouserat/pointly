import type { CreateRoomFormValues, Room } from "@/lib/schemas/room"
import { apiFetch } from "@/lib/api/client"

export async function createRoom(input: CreateRoomFormValues): Promise<Room> {
  const response = await apiFetch("/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to create room")
  }

  return response.json() as Promise<Room>
}

export type RoomWithRelations = Room & {
  participants: Array<{
    id: string
    name: string
    isHost: boolean
    isSpectator: boolean
  }>
  stories: unknown[]
}

export async function fetchRoom(roomId: string): Promise<RoomWithRelations> {
  const response = await apiFetch(`/rooms/${roomId}`)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? "Failed to load room")
  }

  return response.json() as Promise<RoomWithRelations>
}
