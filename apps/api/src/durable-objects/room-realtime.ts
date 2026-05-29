import { DurableObject } from "cloudflare:workers"

import type { RoomRealtimeEvent } from "@/lib/realtime/events"
import type { Bindings } from "@/types"

export class RoomRealtime extends DurableObject<Bindings> {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)

    return new Response(null, { status: 101, webSocket: client })
  }

  async broadcast(event: RoomRealtimeEvent) {
    const payload = JSON.stringify(event)

    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload)
      } catch (error) {
        console.error("Failed to send WebSocket message", error)
      }
    }
  }

  webSocketClose() {
    // Hibernation API: connections are tracked automatically.
  }
}
