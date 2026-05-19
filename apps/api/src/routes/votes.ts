import { zValidator } from "@hono/zod-validator"
import { stories, votes } from "@pointly/db"
import { asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { requireRoomParticipant } from "@/lib/participant"
import type { AppEnv } from "@/types"
import { castVoteSchema, updateVoteSchema } from "@/validators"

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.roomId !== roomId) {
      throw notFound("Story not found")
    }

    const result = await db
      .select()
      .from(votes)
      .where(eq(votes.storyId, storyId))
      .orderBy(asc(votes.createdAt))

    return c.json(result)
  })
  .post("/", zValidator("json", castVoteSchema), async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const body = c.req.valid("json")
    const participant = await requireRoomParticipant(c, roomId)

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.roomId !== roomId) {
      throw notFound("Story not found")
    }

    if (participant.isSpectator) {
      throw new HTTPException(403, { message: "Spectators cannot vote" })
    }

    const [vote] = await db
      .insert(votes)
      .values({ storyId, participantId: participant.id, value: body.value })
      .onConflictDoUpdate({
        target: [votes.storyId, votes.participantId],
        set: { value: body.value, updatedAt: new Date() },
      })
      .returning()

    return c.json(vote, 201)
  })
  .patch("/:voteId", zValidator("json", updateVoteSchema), async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const body = c.req.valid("json")
    const participant = await requireRoomParticipant(c, roomId)

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.roomId !== roomId) {
      throw notFound("Story not found")
    }

    const [existing] = await db
      .select()
      .from(votes)
      .where(eq(votes.id, voteId))
      .limit(1)

    if (!existing || existing.storyId !== storyId) {
      throw notFound("Vote not found")
    }

    if (existing.participantId !== participant.id) {
      throw new HTTPException(403, { message: "You can only update your own vote" })
    }

    const [vote] = await db
      .update(votes)
      .set({ value: body.value, updatedAt: new Date() })
      .where(eq(votes.id, voteId))
      .returning()

    return c.json(vote)
  })
  .delete("/:voteId", async (c) => {
    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const participant = await requireRoomParticipant(c, roomId)

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.roomId !== roomId) {
      throw notFound("Story not found")
    }

    const [existing] = await db
      .select()
      .from(votes)
      .where(eq(votes.id, voteId))
      .limit(1)

    if (!existing || existing.storyId !== storyId) {
      throw notFound("Vote not found")
    }

    if (existing.participantId !== participant.id) {
      throw new HTTPException(403, { message: "You can only delete your own vote" })
    }

    await db.delete(votes).where(eq(votes.id, voteId))

    return c.body(null, 204)
  })

export default app
