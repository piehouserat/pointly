import { zValidator } from "@hono/zod-validator"
import { participants, rooms } from "@pointly/db"
import { asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
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
  .post("/", zValidator("json", createParticipantSchema), async (c) => {
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

    const [participant] = await db
      .insert(participants)
      .values({
        ...body,
        roomId,
        sessionToken: crypto.randomUUID(),
      })
      .returning()

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
  .patch(
    "/:participantId",
    zValidator("json", updateParticipantSchema),
    async (c) => {
      const db = getDb(c)
      const roomId = param(c, "roomId")
      const participantId = param(c, "participantId")
      const body = c.req.valid("json")

      const [existing] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1)

      if (!existing || existing.roomId !== roomId) {
        throw notFound("Participant not found")
      }

      const [participant] = await db
        .update(participants)
        .set(body)
        .where(eq(participants.id, participantId))
        .returning()

      return c.json(participant)
    }
  )
  .delete("/:participantId", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const participantId = param(c, "participantId")

    const [existing] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1)

    if (!existing || existing.roomId !== roomId) {
      throw notFound("Participant not found")
    }

    await db.delete(participants).where(eq(participants.id, participantId))

    return c.body(null, 204)
  })

export default app
