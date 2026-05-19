const prefix = "pointly:participant:"

export function getStoredParticipantId(roomId: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem(`${prefix}${roomId}`)
}

export function setStoredParticipantId(roomId: string, participantId: string) {
  localStorage.setItem(`${prefix}${roomId}`, participantId)
}

export function clearStoredParticipantId(roomId: string) {
  localStorage.removeItem(`${prefix}${roomId}`)
}
