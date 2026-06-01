import { leaveRoom } from "@/lib/api/participants"

export async function leaveRoomNow(
  roomId: string,
  options?: { keepalive?: boolean }
) {
  await leaveRoom(roomId, options)
}
