import { zValidator } from "@hono/zod-validator"
import { db, games, players } from "@pointly/db"
import { asc, eq } from "drizzle-orm"
import { Hono } from "hono"
import { notFound } from "@/lib/errors"
import { param } from "@/lib/params"
import { createPlayerSchema, updatePlayerSchema } from "@/validators"

const app = new Hono()
  .get("/", async (c) => {
    const gameId = param(c, "gameId")

    const result = await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId))
      .orderBy(asc(players.joinedAt))

    return c.json(result)
  })
  .post("/", zValidator("json", createPlayerSchema), async (c) => {
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

    const [player] = await db
      .insert(players)
      .values({
        ...body,
        gameId,
        sessionToken: crypto.randomUUID(),
      })
      .returning()

    return c.json(player, 201)
  })
  .get("/:playerId", async (c) => {
    const gameId = param(c, "gameId")
    const playerId = param(c, "playerId")

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!player || player.gameId !== gameId) {
      throw notFound("Player not found")
    }

    return c.json(player)
  })
  .patch("/:playerId", zValidator("json", updatePlayerSchema), async (c) => {
    const gameId = param(c, "gameId")
    const playerId = param(c, "playerId")
    const body = c.req.valid("json")

    const [existing] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!existing || existing.gameId !== gameId) {
      throw notFound("Player not found")
    }

    const [player] = await db
      .update(players)
      .set(body)
      .where(eq(players.id, playerId))
      .returning()

    return c.json(player)
  })
  .delete("/:playerId", async (c) => {
    const gameId = param(c, "gameId")
    const playerId = param(c, "playerId")

    const [existing] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1)

    if (!existing || existing.gameId !== gameId) {
      throw notFound("Player not found")
    }

    await db.delete(players).where(eq(players.id, playerId))

    return c.body(null, 204)
  })

export default app
