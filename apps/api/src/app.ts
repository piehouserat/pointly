import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"
import games from "@/routes/games"

const app = new Hono()
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: ["http://localhost:3000"],
      allowHeaders: ["Content-Type", "x-player-id"],
    }),
  )
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
