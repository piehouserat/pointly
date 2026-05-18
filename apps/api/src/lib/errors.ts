import { HTTPException } from "hono/http-exception"

export function notFound(message = "Not found") {
  return new HTTPException(404, { message })
}
