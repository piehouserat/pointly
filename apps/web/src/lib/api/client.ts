import { API_BASE } from "@/lib/api-base"

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
}
