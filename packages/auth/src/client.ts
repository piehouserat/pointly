import { anonymousClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

/** API origin where Better Auth is mounted (`/api/auth`). */
export function createPointlyAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [anonymousClient()],
  })
}

export type PointlyAuthClient = ReturnType<typeof createPointlyAuthClient>
