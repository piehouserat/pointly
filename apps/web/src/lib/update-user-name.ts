import { authClient } from "@/lib/auth-client"

export async function updateUserName(name: string) {
  const result = await authClient.updateUser({ name: name.trim() })

  if (result.error) {
    throw new Error(result.error.message ?? "Failed to update profile")
  }

  await authClient.getSession({ query: { disableCookieCache: true } })
}
