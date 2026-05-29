import { zValidator } from "@hono/zod-validator"
import { rooms, stories } from "@pointly/db"
import { and, count, eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { requireRoomParticipant } from "@/lib/participant"
import { notifyRoomAndStories } from "@/lib/realtime/notify"
import { canReveal, getActiveStory, revealStory } from "@/lib/voting"
import type { AppEnv } from "@/types"

const startVotingSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  storyId: z.uuid().optional(),
})

const app = new Hono<AppEnv>()
  .post("/start", zValidator("json", startVotingSchema), async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const body = c.req.valid("json")
    const actor = await requireRoomParticipant(c, roomId)

    if (!actor.isHost) {
      throw new HTTPException(403, { message: "Only the host can start voting" })
    }

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!room) {
      throw notFound("Room not found")
    }

    const existing = await getActiveStory(db, roomId)
    if (existing?.status === "voting") {
      return c.json(existing)
    }

    if (body.storyId) {
      const [target] = await db
        .select()
        .from(stories)
        .where(eq(stories.id, body.storyId))
        .limit(1)

      if (!target || target.roomId !== roomId) {
        throw notFound("Story not found")
      }

      if (target.status !== "pending") {
        throw new HTTPException(400, {
          message: "Only pending stories can be started",
        })
      }

      await db
        .update(stories)
        .set({ status: "skipped", updatedAt: new Date() })
        .where(and(eq(stories.roomId, roomId), eq(stories.status, "voting")))

      const [story] = await db
        .update(stories)
        .set({ status: "voting", updatedAt: new Date() })
        .where(eq(stories.id, target.id))
        .returning()

      await notifyRoomAndStories(c.env, roomId)

      return c.json(story)
    }

    await db
      .update(stories)
      .set({ status: "skipped", updatedAt: new Date() })
      .where(and(eq(stories.roomId, roomId), eq(stories.status, "voting")))

    const [{ value: storyCount }] = await db
      .select({ value: count() })
      .from(stories)
      .where(eq(stories.roomId, roomId))

    const [story] = await db
      .insert(stories)
      .values({
        roomId,
        title: body.title ?? `Round ${storyCount + 1}`,
        status: "voting",
        order: storyCount,
      })
      .returning()

    await notifyRoomAndStories(c.env, roomId)

    return c.json(story, 201)
  })
  .post("/reveal", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const actor = await requireRoomParticipant(c, roomId)

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!room) {
      throw notFound("Room not found")
    }

    if (!canReveal(room, actor)) {
      throw new HTTPException(403, { message: "You cannot reveal cards" })
    }

    const activeStory = await getActiveStory(db, roomId)
    if (!activeStory || activeStory.status !== "voting") {
      throw new HTTPException(400, { message: "No active voting round" })
    }

    const story = await revealStory(db, activeStory.id)

    await notifyRoomAndStories(c.env, roomId)

    return c.json(story)
  })

export default app
