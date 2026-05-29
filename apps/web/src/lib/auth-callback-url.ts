export function authCallbackUrl(path?: string) {
  if (typeof window === "undefined") {
    return "/"
  }

  const nextPath =
    path ?? `${window.location.pathname}${window.location.search}`
  return `${window.location.origin}${nextPath.startsWith("/") ? nextPath : `/${nextPath}`}`
}
