import type { Room } from "@/lib/schemas/room"

export const votingDecks: Record<Room["votingSystem"], string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"],
  t_shirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"],
  powers_of_two: ["0", "1", "2", "4", "8", "16", "32", "64", "?", "☕"],
  sequential: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "?", "☕"],
  custom: [],
}

export function getDeckForRoom(room: Pick<Room, "votingSystem" | "customDeck">) {
  if (room.votingSystem === "custom" && room.customDeck?.length) {
    return room.customDeck
  }
  return votingDecks[room.votingSystem]
}
