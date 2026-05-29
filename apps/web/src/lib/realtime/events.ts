export type RoomRealtimeEvent =
  | { type: "room:updated" }
  | { type: "stories:updated" }
  | { type: "participants:updated" }

export function parseRoomRealtimeEvent(
  data: string
): RoomRealtimeEvent | null {
  try {
    const parsed = JSON.parse(data) as RoomRealtimeEvent
    if (
      parsed?.type === "room:updated" ||
      parsed?.type === "stories:updated" ||
      parsed?.type === "participants:updated"
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}
