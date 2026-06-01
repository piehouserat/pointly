export type RoomRealtimeEvent =
  | { type: "room:updated" }
  | { type: "stories:updated" }
  | { type: "participants:updated" }
  | { type: "vote:cast"; storyId: string; participantId: string; hasVoted: true }
  | { type: "vote:cleared"; storyId: string; participantId: string }
  | {
      type: "voting:started"
      story: { id: string; title: string; status: "voting" }
    }
  | {
      type: "voting:revealed"
      storyId: string
      finalEstimate: string | null
    }

export function parseRoomRealtimeEvent(
  data: string
): RoomRealtimeEvent | null {
  try {
    const parsed = JSON.parse(data) as RoomRealtimeEvent
    switch (parsed?.type) {
      case "room:updated":
      case "stories:updated":
      case "participants:updated":
        return parsed
      case "vote:cast":
        if (
          typeof parsed.storyId === "string" &&
          typeof parsed.participantId === "string" &&
          parsed.hasVoted === true
        ) {
          return parsed
        }
        return null
      case "vote:cleared":
        if (
          typeof parsed.storyId === "string" &&
          typeof parsed.participantId === "string"
        ) {
          return parsed
        }
        return null
      case "voting:started":
        if (
          parsed.story &&
          typeof parsed.story.id === "string" &&
          typeof parsed.story.title === "string" &&
          parsed.story.status === "voting"
        ) {
          return parsed
        }
        return null
      case "voting:revealed":
        if (
          typeof parsed.storyId === "string" &&
          (typeof parsed.finalEstimate === "string" ||
            parsed.finalEstimate === null)
        ) {
          return parsed
        }
        return null
      default:
        return null
    }
  } catch {
    return null
  }
}
