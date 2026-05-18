import { zValidator } from "@hono/zod-validator"
import { games, stories } from "@pointly/db"
import { asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import type { AppEnv } from "@/types"
import { createStorySchema, updateStorySchema } from "@/validators"
import votesRoute from "./votes"

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")

    const result = await db
      .select()
      .from(stories)
      .where(eq(stories.gameId, gameId))
      .orderBy(asc(stories.order), asc(stories.createdAt))

    return c.json(result)
  })
  .post("/", zValidator("json", createStorySchema), async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const body = c.req.valid("json")

    const [game] = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    if (!game) {
      throw notFound("Game not found")
    }

    const [story] = await db
      .insert(stories)
      .values({ ...body, gameId })
      .returning()

    return c.json(story, 201)
  })
  .get("/:storyId", async (c) => {
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

    return c.json(story)
  })
  .patch("/:storyId", zValidator("json", updateStorySchema), async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")
    const body = c.req.valid("json")

    const [existing] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!existing || existing.gameId !== gameId) {
      throw notFound("Story not found")
    }

    const [story] = await db
      .update(stories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(stories.id, storyId))
      .returning()

    return c.json(story)
  })
  .delete("/:storyId", async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const storyId = param(c, "storyId")

    const [existing] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1)

    if (!existing || existing.gameId !== gameId) {
      throw notFound("Story not found")
    }

    await db.delete(stories).where(eq(stories.id, storyId))

    return c.body(null, 204)
  })
  .route("/:storyId/votes", votesRoute)

export default app
