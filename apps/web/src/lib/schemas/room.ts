import { z } from "zod"

export const votingSystemSchema = z.enum([
  "fibonacci",
  "t_shirt",
  "powers_of_two",
  "sequential",
  "custom",
])

export const permissionSchema = z.enum(["all_players", "host_only"])

export const createRoomFormSchema = z.object({
  name: z.string().min(1, "Room name is required").max(200),
  votingSystem: votingSystemSchema,
  whoCanReveal: permissionSchema,
  whoCanManageIssues: permissionSchema,
  autoReveal: z.boolean(),
  funFeatures: z.boolean(),
  showAverage: z.boolean(),
  showCountdown: z.boolean(),
})

export type CreateRoomFormValues = z.infer<typeof createRoomFormSchema>

export const createRoomFormDefaults: CreateRoomFormValues = {
  name: "",
  votingSystem: "fibonacci",
  whoCanReveal: "all_players",
  whoCanManageIssues: "all_players",
  autoReveal: false,
  funFeatures: true,
  showAverage: true,
  showCountdown: true,
}

export type Room = {
  id: string
  name: string
  votingSystem: z.infer<typeof votingSystemSchema>
  customDeck: Array<string> | null
  whoCanReveal: z.infer<typeof permissionSchema>
  whoCanManageIssues: z.infer<typeof permissionSchema>
  autoReveal: boolean
  funFeatures: boolean
  showAverage: boolean
  showCountdown: boolean
  createdAt: string
  updatedAt: string
}

export const votingSystemOptions = [
  {
    value: "fibonacci",
    label: "Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕ )",
  },
  {
    value: "t_shirt",
    label: "T-Shirt ( XS, S, M, L, XL, XXL, ?, ☕ )",
  },
  {
    value: "powers_of_two",
    label: "Powers of 2 ( 0, 1, 2, 4, 8, 16, 32, 64, ?, ☕ )",
  },
  {
    value: "sequential",
    label: "Sequential ( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ?, ☕ )",
  },
  { value: "custom", label: "Custom deck" },
] as const satisfies ReadonlyArray<{
  value: CreateRoomFormValues["votingSystem"]
  label: string
}>

export const permissionOptions = [
  { value: "all_players", label: "All participants" },
  { value: "host_only", label: "Host only" },
] as const satisfies ReadonlyArray<{
  value: CreateRoomFormValues["whoCanReveal"]
  label: string
}>
