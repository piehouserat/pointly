import { sendTestEmail } from "@pointly/email"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

import type { AppEnv } from "@/types"

const app = new Hono<AppEnv>().post("/test", async (c) => {
  const to = c.req.query("to") ?? c.env.EMAIL_TEST_TO
  if (!to) {
    throw new HTTPException(400, {
      message: "Provide ?to= or set the EMAIL_TEST_TO secret",
    })
  }

  const from = c.env.EMAIL_FROM ?? "noreply@point-ly.com"

  try {
    const result = await sendTestEmail(c.env.EMAIL, { to, from })
    return c.json({ ok: true, messageId: result.messageId })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send test email"
    const code =
      error instanceof Error && "code" in error
        ? String(error.code)
        : undefined

    throw new HTTPException(502, {
      message: code ? `${code}: ${message}` : message,
    })
  }
})

export default app
