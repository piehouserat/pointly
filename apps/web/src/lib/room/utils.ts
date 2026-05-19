export function participantInitial(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return trimmed[0]!.toUpperCase()
}

export function getRoomInviteUrl(roomId: string) {
  if (typeof window === "undefined") {
    return ""
  }
  return `${window.location.origin}/rooms/${roomId}`
}

export function copyRoomInviteLink(roomId: string) {
  return navigator.clipboard.writeText(getRoomInviteUrl(roomId))
}
