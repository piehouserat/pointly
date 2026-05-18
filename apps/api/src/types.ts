import type { Db } from "@pointly/db"

export type Bindings = {
  DATABASE_URL: string
  CORS_ORIGIN?: string
}

export type Variables = {
  db: Db
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
