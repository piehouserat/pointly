import type { Context } from "hono"

export function param(c: Context, key: string): string {
  const value = c.req.param(key)
  if (!value) {
    throw new Error(`Missing route param: ${key}`)
  }
  return value
}
