import { DurableObject } from "cloudflare:workers"
import { createDb, participants } from "@pointly/db"
import { eq } from "drizzle-orm"

import type { RoomRealtimeEvent } from "@/lib/realtime/events"
import { notifyParticipants } from "@/lib/realtime/notify"
import type { Bindings } from "@/types"

const disconnectGraceMs = 15_000

type WsAttachment = {
  participantId: string
  roomId: string
}

type PendingRemoval = {
  removeAt: number
  roomId: string
}

export class RoomRealtime extends DurableObject<Bindings> {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 })
    }

    const roomId = this.roomIdFromRequest(request)
    const participantId = new URL(request.url).searchParams.get("participantId")

    if (!participantId) {
      return new Response("Missing participant", { status: 400 })
    }

    await this.cancelParticipantRemoval(participantId)
    await this.incrementConnections(participantId)

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)
    server.serializeAttachment({ participantId, roomId } satisfies WsAttachment)

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

  async webSocketClose(ws: WebSocket) {
    const attachment = ws.deserializeAttachment() as WsAttachment | null
    if (!attachment?.participantId || !attachment.roomId) return

    const remaining = await this.decrementConnections(attachment.participantId)
    if (remaining > 0) return

    await this.scheduleParticipantRemoval(
      attachment.participantId,
      attachment.roomId
    )
  }

  async webSocketMessage() {
    // Required for hibernation; room events use REST + broadcast.
  }

  async alarm() {
    const now = Date.now()
    const pending = await this.ctx.storage.list<PendingRemoval>({
      prefix: "pending:",
    })

    for (const [key, value] of pending) {
      if (value.removeAt > now) continue

      const participantId = key.slice("pending:".length)
      await this.removeParticipant(participantId, value.roomId)
      await this.ctx.storage.delete(key)
      await this.ctx.storage.delete(this.connectionsKey(participantId))
    }

    await this.syncAlarm()
  }

  private roomIdFromRequest(request: Request) {
    const match = new URL(request.url).pathname.match(/^\/rooms\/([^/]+)\/ws$/)
    if (!match) {
      throw new Error("Invalid room WebSocket path")
    }
    return match[1]!
  }

  private pendingKey(participantId: string) {
    return `pending:${participantId}`
  }

  private connectionsKey(participantId: string) {
    return `connections:${participantId}`
  }

  private async incrementConnections(participantId: string) {
    const key = this.connectionsKey(participantId)
    const count = ((await this.ctx.storage.get<number>(key)) ?? 0) + 1
    await this.ctx.storage.put(key, count)
  }

  private async decrementConnections(participantId: string) {
    const key = this.connectionsKey(participantId)
    const count = Math.max(0, ((await this.ctx.storage.get<number>(key)) ?? 1) - 1)

    if (count === 0) {
      await this.ctx.storage.delete(key)
      return 0
    }

    await this.ctx.storage.put(key, count)
    return count
  }

  private async scheduleParticipantRemoval(
    participantId: string,
    roomId: string
  ) {
    await this.ctx.storage.put(this.pendingKey(participantId), {
      removeAt: Date.now() + disconnectGraceMs,
      roomId,
    } satisfies PendingRemoval)
    await this.syncAlarm()
  }

  private async cancelParticipantRemoval(participantId: string) {
    await this.ctx.storage.delete(this.pendingKey(participantId))
    await this.syncAlarm()
  }

  private async syncAlarm() {
    const pending = await this.ctx.storage.list<PendingRemoval>({
      prefix: "pending:",
    })

    let nextAlarm: number | null = null
    for (const [, value] of pending) {
      if (nextAlarm === null || value.removeAt < nextAlarm) {
        nextAlarm = value.removeAt
      }
    }

    if (nextAlarm === null) {
      await this.ctx.storage.deleteAlarm()
      return
    }

    await this.ctx.storage.setAlarm(nextAlarm)
  }

  private async removeParticipant(participantId: string, roomId: string) {
    const db = createDb(this.env.DATABASE_URL)
    const removed = await db
      .delete(participants)
      .where(eq(participants.id, participantId))
      .returning({ id: participants.id })

    if (removed.length > 0) {
      await notifyParticipants(this.env, roomId)
    }
  }
}
