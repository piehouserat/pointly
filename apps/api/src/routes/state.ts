import { participants, rooms, votes } from "@pointly/db"
import { asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { requireRoomParticipant } from "@/lib/participant"
import {
  canReveal,
  getActiveStory,
  mapVotesForParticipants,
} from "@/lib/voting"
import type { AppEnv } from "@/types"

const app = new Hono<AppEnv>().get("/", async (c) => {
  const db = getDb(c)
  const roomId = param(c, "roomId")
  const viewer = await requireRoomParticipant(c, roomId)

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1)

  if (!room) {
    throw notFound("Room not found")
  }

  const roomParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.roomId, roomId))
    .orderBy(asc(participants.joinedAt))

  const activeStory = await getActiveStory(db, roomId)

  if (!activeStory) {
    return c.json({
      room,
      participants: roomParticipants,
      activeStory: null,
      canReveal: false,
    })
  }

  const voteRows = await db
    .select()
    .from(votes)
    .where(eq(votes.storyId, activeStory.id))

  const voteViews = mapVotesForParticipants(
    activeStory,
    roomParticipants,
    voteRows,
    viewer.id
  )

  return c.json({
    room,
    participants: roomParticipants,
    activeStory: {
      id: activeStory.id,
      title: activeStory.title,
      status: activeStory.status,
      finalEstimate: activeStory.finalEstimate,
      votes: voteViews,
    },
    canReveal:
      activeStory.status === "voting" &&
      canReveal(room, viewer),
  })
})

export default app
