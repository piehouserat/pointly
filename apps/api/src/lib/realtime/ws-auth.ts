import { createDb, participants } from '@pointly/db';
import type { Participant } from '@pointly/db';
import { and, eq } from "drizzle-orm"

import { getAuth } from "@/lib/auth"
import type { Bindings } from "@/types"

export type RoomWebSocketAuthResult =
  | { error: Response }
  | { participant: Participant }

export async function requireRoomWebSocketParticipant(
  request: Request,
  env: Bindings,
  roomId: string
): Promise<RoomWebSocketAuthResult> {
  const auth = getAuth(env)
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return { error: new Response("Unauthorized", { status: 401 }) }
  }

  const db = createDb(env.DATABASE_URL)
  const [participant] = await db
    .select()
    .from(participants)
    .where(
      and(eq(participants.roomId, roomId), eq(participants.userId, session.user.id))
    )
    .limit(1)

  if (!participant) {
    return { error: new Response("Participant not found", { status: 404 }) }
  }

  return { participant }
}
