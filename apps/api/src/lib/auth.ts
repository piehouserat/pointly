import type { Bindings } from "@/types"
import { createAuth } from "@pointly/auth"

const cache = new Map<string, ReturnType<typeof createAuth>>()

export function getAuth(env: Bindings) {
  const key = `${env.DATABASE_URL}\0${env.BETTER_AUTH_SECRET}\0${env.BETTER_AUTH_URL}`
  const existing = cache.get(key)
  if (existing) {
    return existing
  }

  const auth = createAuth({
    databaseUrl: env.DATABASE_URL,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigin: env.CORS_ORIGIN,
  })

  cache.set(key, auth)
  return auth
}
