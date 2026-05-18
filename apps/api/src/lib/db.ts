import type { Context } from "hono"
import type { AppEnv } from "@/types"

export function getDb(c: Context<AppEnv>) {
  return c.get("db")
}
