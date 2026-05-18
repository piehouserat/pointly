import type { Context } from "hono"
import type { AppEnv } from "@/types"

export function param(c: Context<AppEnv>, key: string): string {
  const value = c.req.param(key)
  if (!value) {
    throw new Error(`Missing route param: ${key}`)
  }
  return value
}
