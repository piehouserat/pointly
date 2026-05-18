import { zValidator } from "@hono/zod-validator"
import { games, players, stories } from "@pointly/db"
import { asc, desc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import type { AppEnv } from "@/types"
import { createGameSchema, updateGameSchema } from "@/validators"
import playersRoute from "./players"
import storiesRoute from "./stories"

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const db = getDb(c)
    const result = await db
      .select()
      .from(games)
      .orderBy(desc(games.createdAt))

    return c.json(result)
  })
  .post("/", zValidator("json", createGameSchema), async (c) => {
    const db = getDb(c)
    const body = c.req.valid("json")

    const [game] = await db.insert(games).values(body).returning()

    return c.json(game, 201)
  })
  .get("/:gameId", async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")

    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    if (!game) {
      throw notFound("Game not found")
    }

    const [gamePlayers, gameStories] = await Promise.all([
      db
        .select()
        .from(players)
        .where(eq(players.gameId, gameId))
        .orderBy(asc(players.joinedAt)),
      db
        .select()
        .from(stories)
        .where(eq(stories.gameId, gameId))
        .orderBy(asc(stories.order), asc(stories.createdAt)),
    ])

    return c.json({ ...game, players: gamePlayers, stories: gameStories })
  })
  .patch("/:gameId", zValidator("json", updateGameSchema), async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")
    const body = c.req.valid("json")

    const [game] = await db
      .update(games)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(games.id, gameId))
      .returning()

    if (!game) {
      throw notFound("Game not found")
    }

    return c.json(game)
  })
  .delete("/:gameId", async (c) => {
    const db = getDb(c)
    const gameId = param(c, "gameId")

    const [game] = await db.delete(games).where(eq(games.id, gameId)).returning()

    if (!game) {
      throw notFound("Game not found")
    }

    return c.body(null, 204)
  })
  .route("/:gameId/players", playersRoute)
  .route("/:gameId/stories", storiesRoute)

export default app
