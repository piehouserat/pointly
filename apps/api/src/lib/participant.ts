import { participants } from "@pointly/db"
import { and, eq } from "drizzle-orm"
import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

import { getDb } from "@/lib/db"
import { notFound } from "@/lib/errors"
import type { AppEnv } from "@/types"

export async function requireRoomParticipant(
  c: Context<AppEnv>,
  roomId: string
) {
  const user = c.get("user")
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  const db = getDb(c)
  const [participant] = await db
    .select()
    .from(participants)
    .where(
      and(eq(participants.roomId, roomId), eq(participants.userId, user.id))
    )
    .limit(1)

  if (!participant) {
    throw notFound("Participant not found")
  }

  return participant
}
