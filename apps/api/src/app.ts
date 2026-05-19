import { createDb } from "@pointly/db"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"

import { getAuth } from "@/lib/auth"
import rooms from "@/routes/rooms"
import type { AppEnv } from "@/types"

const app = new Hono<AppEnv>()
  .use("*", logger())
  .use("*", async (c, next) => {
    c.set("db", createDb(c.env.DATABASE_URL))
    c.set("auth", getAuth(c.env))
    await next()
  })
  .use("*", async (c, next) => {
    const origin = c.env.CORS_ORIGIN ?? "http://localhost:3000"
    return cors({
      origin: [origin],
      allowHeaders: ["Content-Type", "Cookie"],
      allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })(c, next)
  })
  .use("*", async (c, next) => {
    const auth = c.get("auth")
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    c.set("user", session?.user ?? null)
    c.set("session", session?.session ?? null)
    await next()
  })
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return c.get("auth").handler(c.req.raw)
  })
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/rooms", rooms)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status)
    }

    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  })

export default app
