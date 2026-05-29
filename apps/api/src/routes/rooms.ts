import { zValidator } from "@hono/zod-validator"
import { participants, rooms, stories } from "@pointly/db"
import { asc, desc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { notifyRoomState } from "@/lib/realtime/notify"
import type { AppEnv } from "@/types"
import { createRoomSchema, updateRoomSchema } from "@/validators"
import participantsRoute from "./participants"
import stateRoute from "./state"
import storiesRoute from "./stories"
import votingRoute from "./voting"

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const db = getDb(c)
    const result = await db.select().from(rooms).orderBy(desc(rooms.createdAt))

    return c.json(result)
  })
  .post("/", zValidator("json", createRoomSchema), async (c) => {
    const db = getDb(c)
    const body = c.req.valid("json")

    const [room] = await db.insert(rooms).values(body).returning()

    return c.json(room, 201)
  })
  .get("/:roomId", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!room) {
      throw notFound("Room not found")
    }

    const [roomParticipants, roomStories] = await Promise.all([
      db
        .select()
        .from(participants)
        .where(eq(participants.roomId, roomId))
        .orderBy(asc(participants.joinedAt)),
      db
        .select()
        .from(stories)
        .where(eq(stories.roomId, roomId))
        .orderBy(asc(stories.order), asc(stories.createdAt)),
    ])

    return c.json({
      ...room,
      participants: roomParticipants,
      stories: roomStories,
    })
  })
  .patch("/:roomId", zValidator("json", updateRoomSchema), async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const body = c.req.valid("json")

    const [room] = await db
      .update(rooms)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(rooms.id, roomId))
      .returning()

    if (!room) {
      throw notFound("Room not found")
    }

    await notifyRoomState(c.env, roomId)

    return c.json(room)
  })
  .delete("/:roomId", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")

    const [room] = await db
      .delete(rooms)
      .where(eq(rooms.id, roomId))
      .returning()

    if (!room) {
      throw notFound("Room not found")
    }

    return c.body(null, 204)
  })
  .route("/:roomId/participants", participantsRoute)
  .route("/:roomId/state", stateRoute)
  .route("/:roomId/voting", votingRoute)
  .route("/:roomId/stories", storiesRoute)

export default app
