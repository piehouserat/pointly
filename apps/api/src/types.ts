import type { Auth } from "@pointly/auth"
import type { Db } from "@pointly/db"

import type { RoomRealtime } from "@/durable-objects/room-realtime"

export type Bindings = {
  DATABASE_URL: string
  CORS_ORIGIN?: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  ROOM_REALTIME: DurableObjectNamespace<RoomRealtime>
}

export type AuthUser = Auth["$Infer"]["Session"]["user"]
export type AuthSession = Auth["$Infer"]["Session"]["session"]

export type Variables = {
  db: Db
  auth: Auth
  user: AuthUser | null
  session: AuthSession | null
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
