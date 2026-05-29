import { API_BASE } from "@/lib/api-base"

export function roomWebSocketUrl(roomId: string) {
  const url = new URL(API_BASE)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = `/rooms/${roomId}/ws`
  url.search = ""
  url.hash = ""
  return url.toString()
}
