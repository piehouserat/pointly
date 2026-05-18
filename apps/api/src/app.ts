import { createDb } from "@pointly/db"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"
import games from "@/routes/games"
import type { AppEnv } from "@/types"

const app = new Hono<AppEnv>()
  .use("*", logger())
  .use("*", async (c, next) => {
    c.set("db", createDb(c.env.DATABASE_URL))
    await next()
  })
  .use("*", async (c, next) => {
    const origin = c.env.CORS_ORIGIN ?? "http://localhost:3000"
    return cors({
      origin: [origin],
      allowHeaders: ["Content-Type", "x-player-id"],
    })(c, next)
  })
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/games", games)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status)
    }

    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  })

export default app
