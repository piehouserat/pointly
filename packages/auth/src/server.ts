import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { createDb } from "@pointly/db"
import * as schema from "@pointly/db/schema"
import { betterAuth } from "better-auth"
import { anonymous, magicLink } from "better-auth/plugins"

export type SendMagicLinkFn = (params: {
  email: string
  token: string
  url: string
}) => Promise<void>

export type CreateAuthOptions = {
  databaseUrl: string
  secret: string
  baseURL: string
  trustedOrigin?: string
  sendMagicLink?: SendMagicLinkFn
}

export function createAuth(options: CreateAuthOptions) {
  const db = createDb(options.databaseUrl)
  const trustedOrigins =
    options.trustedOrigin ?
      [...new Set([options.baseURL, options.trustedOrigin])]
    : [options.baseURL]

  return betterAuth({
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    plugins: [
      anonymous(),
      ...(options.sendMagicLink ?
        [
          magicLink({
            sendMagicLink: async ({ email, token, url }) => {
              await options.sendMagicLink!({ email, token, url })
            },
          }),
        ]
      : []),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
