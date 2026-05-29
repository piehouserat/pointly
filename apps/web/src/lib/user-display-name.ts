export type AuthUserLike = {
  name: string
  email: string
  isAnonymous?: boolean | null
}

/** True when a signed-in user has chosen a display name (not anonymous / email placeholder). */
export function hasUserDisplayName(user: AuthUserLike): boolean {
  if (user.isAnonymous) return false

  const name = user.name.trim()
  if (!name) return false

  if (name.toLowerCase() === user.email.toLowerCase()) return false

  return true
}

/** Label for menus and triggers: profile name when set, otherwise email. */
export function getUserMenuLabel(user: AuthUserLike): string {
  if (hasUserDisplayName(user)) {
    return user.name.trim()
  }

  return user.email
}

/** Trigger label: participant name for anonymous users in a room, otherwise account label. */
export function getUserMenuTriggerLabel(
  user: AuthUserLike | null | undefined,
  participant?: { name: string } | null
): string {
  const participantName = participant?.name.trim()
  if (user?.isAnonymous !== false && participantName) {
    return participantName
  }

  if (user) {
    return getUserMenuLabel(user)
  }

  return "Guest"
}

export function userMenuInitial(label: string) {
  const trimmed = label.trim()
  if (!trimmed) return "?"

  if (trimmed.includes("@")) {
    return trimmed[0]!.toUpperCase()
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }

  return trimmed[0]!.toUpperCase()
}
