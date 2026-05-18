import { z } from "zod"

export const votingSystemSchema = z.enum([
  "fibonacci",
  "t_shirt",
  "powers_of_two",
  "sequential",
  "custom",
])

export const permissionSchema = z.enum(["all_players", "host_only"])

export const storyStatusSchema = z.enum([
  "pending",
  "voting",
  "revealed",
  "skipped",
])

export const createGameSchema = z.object({
  name: z.string().min(1).max(200),
  votingSystem: votingSystemSchema.optional(),
  customDeck: z.array(z.string()).optional(),
  whoCanReveal: permissionSchema.optional(),
  whoCanManageIssues: permissionSchema.optional(),
  autoReveal: z.boolean().optional(),
  funFeatures: z.boolean().optional(),
  showAverage: z.boolean().optional(),
  showCountdown: z.boolean().optional(),
})

export const updateGameSchema = createGameSchema.partial()

export const createPlayerSchema = z.object({
  name: z.string().min(1).max(100),
  isHost: z.boolean().optional(),
  isSpectator: z.boolean().optional(),
})

export const updatePlayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isSpectator: z.boolean().optional(),
})

export const createStorySchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  url: z.url().optional(),
  order: z.number().int().min(0).optional(),
})

export const updateStorySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  url: z.url().nullable().optional(),
  status: storyStatusSchema.optional(),
  finalEstimate: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const castVoteSchema = z.object({
  value: z.string().min(1).max(50),
})

export const updateVoteSchema = z.object({
  value: z.string().min(1).max(50),
})
