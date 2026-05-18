import { zValidator } from "@hono/zod-validator"
import { players, stories, votes } from "@pointly/db"
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
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.gameId !== gameId) {
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
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")
    const body = c.req.valid("json")
    const playerId = c.req.header("x-player-id")

    if (!playerId) {
      return c.json({ error: "x-player-id header is required" }, 400)
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.gameId !== gameId) {
      throw notFound("Story not found")
    }

    const [player] = await db
      .select()
      .from(players)
      .where(and(eq(players.id, playerId), eq(players.gameId, gameId)))
      .limit(1)

    if (!player) {
      throw notFound("Player not found")
    }

    if (player.isSpectator) {
      return c.json({ error: "Spectators cannot vote" }, 403)
    }

    const [vote] = await db
      .insert(votes)
      .values({ storyId, playerId, value: body.value })
      .onConflictDoUpdate({
        target: [votes.storyId, votes.playerId],
        set: { value: body.value, updatedAt: new Date() },
      })
      .returning()

    return c.json(vote, 201)
  })
  .patch("/:voteId", zValidator("json", updateVoteSchema), async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const body = c.req.valid("json")
    const playerId = c.req.header("x-player-id")

    if (!playerId) {
      return c.json({ error: "x-player-id header is required" }, 400)
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.gameId !== gameId) {
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

    if (existing.playerId !== playerId) {
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
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")
    const voteId = param(c, "voteId")
    const playerId = c.req.header("x-player-id")

    if (!playerId) {
      return c.json({ error: "x-player-id header is required" }, 400)
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!story || story.gameId !== gameId) {
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

    if (existing.playerId !== playerId) {
      return c.json({ error: "You can only delete your own vote" }, 403)
    }

    await db.delete(votes).where(eq(votes.id, voteId))

    return c.body(null, 204)
  })

export default app
