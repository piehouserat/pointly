import type { RoomState, VoteView } from "@/lib/api/room-state"
import { canRevealCards } from "@/lib/room/permissions"
import type { RoomRealtimeEvent } from "@/lib/realtime/events"

function emptyVotes(participants: RoomState["participants"]): Array<VoteView> {
  return participants
    .filter((participant) => !participant.isSpectator)
    .map((participant) => ({
      participantId: participant.id,
      hasVoted: false,
      value: null,
    }))
}

function patchVote(
  votes: Array<VoteView>,
  participantId: string,
  patch: Pick<VoteView, "hasVoted" | "value">
) {
  const index = votes.findIndex((vote) => vote.participantId === participantId)
  if (index === -1) return votes

  const next = [...votes]
  next[index] = { ...next[index], ...patch }
  return next
}

export function applyOwnVoteUpdate(
  state: RoomState,
  storyId: string,
  vote: VoteView
): RoomState {
  if (
    !state.activeStory ||
    state.activeStory.id !== storyId ||
    state.activeStory.status !== "voting"
  ) {
    return state
  }

  return {
    ...state,
    activeStory: {
      ...state.activeStory,
      votes: patchVote(state.activeStory.votes, vote.participantId, {
        hasVoted: vote.hasVoted,
        value: vote.value,
      }),
    },
  }
}

export function applyRoomRealtimeEvent(
  state: RoomState,
  event: RoomRealtimeEvent,
  viewerParticipantId?: string
): RoomState {
  switch (event.type) {
    case "vote:cast": {
      if (
        !state.activeStory ||
        state.activeStory.id !== event.storyId ||
        state.activeStory.status !== "voting"
      ) {
        return state
      }

      const existing = state.activeStory.votes.find(
        (vote) => vote.participantId === event.participantId
      )

      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          votes: patchVote(state.activeStory.votes, event.participantId, {
            hasVoted: true,
            value: existing?.value ?? null,
          }),
        },
      }
    }

    case "vote:cleared": {
      if (
        !state.activeStory ||
        state.activeStory.id !== event.storyId ||
        state.activeStory.status !== "voting"
      ) {
        return state
      }

      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          votes: patchVote(state.activeStory.votes, event.participantId, {
            hasVoted: false,
            value: null,
          }),
        },
      }
    }

    case "voting:started": {
      const viewer = viewerParticipantId
        ? state.participants.find(
            (participant) => participant.id === viewerParticipantId
          )
        : undefined

      return {
        ...state,
        canReveal: viewer ? canRevealCards(state.room, viewer) : state.canReveal,
        activeStory: {
          id: event.story.id,
          title: event.story.title,
          status: "voting",
          finalEstimate: null,
          votes: emptyVotes(state.participants),
        },
      }
    }

    default:
      return state
  }
}
