import type { RoomRealtimeEvent } from "@/lib/realtime/events"
import type { Bindings } from "@/types"

export async function notifyRoom(
  env: Bindings,
  roomId: string,
  event: RoomRealtimeEvent
) {
  try {
    const id = env.ROOM_REALTIME.idFromName(roomId)
    const stub = env.ROOM_REALTIME.get(id)
    await stub.broadcast(event)
  } catch (error) {
    console.error("Failed to broadcast room event", { roomId, event, error })
  }
}

export function notifyRoomState(env: Bindings, roomId: string) {
  return notifyRoom(env, roomId, { type: "room:updated" })
}

export function notifyStories(env: Bindings, roomId: string) {
  return notifyRoom(env, roomId, { type: "stories:updated" })
}

export function notifyParticipants(env: Bindings, roomId: string) {
  return notifyRoom(env, roomId, { type: "participants:updated" })
}

export function notifyVoteCast(
  env: Bindings,
  roomId: string,
  storyId: string,
  participantId: string
) {
  return notifyRoom(env, roomId, {
    type: "vote:cast",
    storyId,
    participantId,
    hasVoted: true,
  })
}

export function notifyVoteCleared(
  env: Bindings,
  roomId: string,
  storyId: string,
  participantId: string
) {
  return notifyRoom(env, roomId, {
    type: "vote:cleared",
    storyId,
    participantId,
  })
}

export function notifyVotingStarted(
  env: Bindings,
  roomId: string,
  story: { id: string; title: string }
) {
  return notifyRoom(env, roomId, {
    type: "voting:started",
    story: { ...story, status: "voting" },
  })
}

export function notifyVotingRevealed(
  env: Bindings,
  roomId: string,
  storyId: string,
  finalEstimate: string | null
) {
  return notifyRoom(env, roomId, {
    type: "voting:revealed",
    storyId,
    finalEstimate,
  })
}

export async function notifyRoomAndStories(env: Bindings, roomId: string) {
  await notifyRoomState(env, roomId)
  await notifyStories(env, roomId)
}
