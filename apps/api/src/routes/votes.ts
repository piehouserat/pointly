import { zValidator } from "@hono/zod-validator"
import { participants, stories, votes } from "@pointly/db"
import { and, asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
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
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const body = c.req.valid("json")
    const participantId = c.req.header("x-participant-id")

    if (!participantId) {
      return c.json({ error: "x-participant-id header is required" }, 400)
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.roomId !== roomId) {
      throw notFound("Story not found")
    }

    const [participant] = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.id, participantId),
          eq(participants.roomId, roomId)
        )
      )
      .limit(1)

    if (!participant) {
      throw notFound("Participant not found")
    }

    if (participant.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403)
    }

    if (participant.isSpectator) {
      return c.json({ error: "Spectators cannot vote" }, 403)
    }

    const [vote] = await db
      .insert(votes)
      .values({ storyId, participantId, value: body.value })
      .onConflictDoUpdate({
        target: [votes.storyId, votes.participantId],
        set: { value: body.value, updatedAt: new Date() },
      })
      .returning()

    return c.json(vote, 201)
  })
  .patch("/:voteId", zValidator("json", updateVoteSchema), async (c) => {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const body = c.req.valid("json")
    const participantId = c.req.header("x-participant-id")

    if (!participantId) {
      return c.json({ error: "x-participant-id header is required" }, 400)
    }

    const [voter] = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.id, participantId),
          eq(participants.roomId, roomId)
        )
      )
      .limit(1)

    if (!voter || voter.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403)
    }

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

    if (existing.participantId !== participantId) {
      return c.json({ error: "You can only update your own vote" }, 403)
    }

    const [vote] = await db
      .update(votes)
      .set({ value: body.value, updatedAt: new Date() })
      .where(eq(votes.id, voteId))
      .returning()

    return c.json(vote)
  })
  .delete("/:voteId", async (c) => {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const db = getDb(c)
    const roomId = param(c, "roomId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const participantId = c.req.header("x-participant-id")

    if (!participantId) {
      return c.json({ error: "x-participant-id header is required" }, 400)
    }

    const [voter] = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.id, participantId),
          eq(participants.roomId, roomId)
        )
      )
      .limit(1)

    if (!voter || voter.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403)
    }

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

    if (existing.participantId !== participantId) {
      return c.json({ error: "You can only delete your own vote" }, 403)
    }

    await db.delete(votes).where(eq(votes.id, voteId))

    return c.body(null, 204)
  })

export default app
