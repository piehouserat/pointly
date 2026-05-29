import app from "./app"
import { RoomRealtime } from "./durable-objects/room-realtime"
import { requireRoomWebSocketParticipant } from "./lib/realtime/ws-auth"
import type { Bindings } from "./types"

export { RoomRealtime }

const roomWebSocketPattern = /^\/rooms\/([^/]+)\/ws$/

export default {
  async fetch(
    request: Request,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(roomWebSocketPattern)

    if (match && request.headers.get("Upgrade") === "websocket") {
      const roomId = match[1]!
      const auth = await requireRoomWebSocketParticipant(request, env, roomId)

      if ("error" in auth) {
        return auth.error
      }

      const id = env.ROOM_REALTIME.idFromName(roomId)
      return env.ROOM_REALTIME.get(id).fetch(request)
    }

    return app.fetch(request, env, ctx)
  },
}
