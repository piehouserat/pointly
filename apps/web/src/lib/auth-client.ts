import { createPointlyAuthClient } from "@pointly/auth/client"

import { API_BASE } from "@/lib/api-base"

export const authClient = createPointlyAuthClient(API_BASE)
