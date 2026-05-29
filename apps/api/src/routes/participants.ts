import { zValidator } from "@hono/zod-validator"
import { participants, rooms } from "@pointly/db"
import { and, asc, count, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { notifyRoomState } from "@/lib/realtime/notify"
import { requireRoomParticipant } from "@/lib/participant"
import type { AppEnv } from "@/types"
import { createParticipantSchema, updateParticipantSchema } from "@/validators"

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")

    const result = await db
      .select()
      .from(participants)
      .where(eq(participants.roomId, roomId))
      .orderBy(asc(participants.joinedAt))

    return c.json(result)
  })
  .get("/me", async (c) => {
    const roomId = param(c, "roomId")
    const participant = await requireRoomParticipant(c, roomId)
    return c.json(participant)
  })
  .patch("/me", zValidator("json", updateParticipantSchema), async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const body = c.req.valid("json")
    const existing = await requireRoomParticipant(c, roomId)

    const [participant] = await db
      .update(participants)
      .set(body)
      .where(eq(participants.id, existing.id))
      .returning()

    await notifyRoomState(c.env, roomId)

    return c.json(participant)
  })
  .delete("/me", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const existing = await requireRoomParticipant(c, roomId)

    await db.delete(participants).where(eq(participants.id, existing.id))

    await notifyRoomState(c.env, roomId)

    return c.body(null, 204)
  })
  .post("/", zValidator("json", createParticipantSchema), async (c) => {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const db = getDb(c)
    const roomId = param(c, "roomId")
    const body = c.req.valid("json")

    const [room] = await db
      .select({ id: rooms.id })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1)

    if (!room) {
      throw notFound("Room not found")
    }

    const [existing] = await db
      .select()
      .from(participants)
      .where(
        and(eq(participants.roomId, roomId), eq(participants.userId, user.id))
      )
      .limit(1)

    if (existing) {
      return c.json(existing)
    }

    const [{ value: participantCount }] = await db
      .select({ value: count() })
      .from(participants)
      .where(eq(participants.roomId, roomId))

    const [participant] = await db
      .insert(participants)
      .values({
        name: body.name,
        isSpectator: body.isSpectator ?? false,
        isHost: participantCount === 0,
        roomId,
        userId: user.id,
      })
      .returning()

    await notifyRoomState(c.env, roomId)

    return c.json(participant, 201)
  })
  .get("/:participantId", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const participantId = param(c, "participantId")

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1)

    if (!participant || participant.roomId !== roomId) {
      throw notFound("Participant not found")
    }

    return c.json(participant)
  })

export default app
