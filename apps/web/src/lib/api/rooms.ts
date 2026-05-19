import type { CreateRoomFormValues, Room } from "@/lib/schemas/room"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

export async function createRoom(input: CreateRoomFormValues): Promise<Room> {
  const response = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? "Failed to create room")
  }

  return response.json() as Promise<Room>
}
