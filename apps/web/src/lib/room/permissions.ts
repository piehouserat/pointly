import type { Participant } from "@/lib/api/participants"
import type { Room } from "@/lib/schemas/room"

export function canRevealCards(
  room: Pick<Room, "whoCanReveal">,
  participant: Pick<Participant, "isHost">
) {
  if (room.whoCanReveal === "all_players") return true
  return participant.isHost
}
