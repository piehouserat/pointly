import type { Participant } from "@/lib/api/participants"
import type { RoomState } from "@/lib/api/room-state"
import type { Story } from "@/lib/api/stories"
import type { RoomWithRelations } from "@/lib/api/rooms"

export function buildRoomWithRelations(
  state: RoomState,
  stories: Array<Story>
): RoomWithRelations {
  return {
    ...state.room,
    participants: state.participants.map(({ id, name, isHost, isSpectator }) => ({
      id,
      name,
      isHost,
      isSpectator,
    })),
    stories,
  }
}

export function resolveParticipant(
  participants: Array<Participant>,
  participantId: string,
  fallback: Participant
): Participant {
  return participants.find((p) => p.id === participantId) ?? fallback
}

export function patchRoomStateRoom(
  state: RoomState,
  next: RoomWithRelations
): RoomState {
  const { participants: _participants, stories: _stories, ...room } = next
  return { ...state, room }
}

export function patchRoomStateParticipant(
  state: RoomState,
  participant: Participant
): RoomState {
  return {
    ...state,
    participants: state.participants.map((p) =>
      p.id === participant.id ? participant : p
    ),
  }
}
