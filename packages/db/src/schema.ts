import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth-schema"

export * from "./auth-schema"

export const votingSystemEnum = pgEnum("voting_system", [
  "fibonacci",
  "t_shirt",
  "powers_of_two",
  "sequential",
  "custom",
])

export const permissionEnum = pgEnum("permission", ["all_players", "host_only"])

export const storyStatusEnum = pgEnum("story_status", [
  "pending",
  "voting",
  "revealed",
  "skipped",
])

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  votingSystem: votingSystemEnum("voting_system")
    .notNull()
    .default("fibonacci"),
  customDeck: jsonb("custom_deck").$type<Array<string>>(),
  whoCanReveal: permissionEnum("who_can_reveal")
    .notNull()
    .default("all_players"),
  whoCanManageIssues: permissionEnum("who_can_manage_issues")
    .notNull()
    .default("all_players"),
  autoReveal: boolean("auto_reveal").notNull().default(false),
  funFeatures: boolean("fun_features").notNull().default(true),
  showAverage: boolean("show_average").notNull().default(true),
  showCountdown: boolean("show_countdown").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isHost: boolean("is_host").notNull().default(false),
  isSpectator: boolean("is_spectator").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
})

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  status: storyStatusEnum("status").notNull().default("pending"),
  finalEstimate: text("final_estimate"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_story_participant_vote").on(
      table.storyId,
      table.participantId
    ),
  ]
)

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert
export type Story = typeof stories.$inferSelect
export type NewStory = typeof stories.$inferInsert
export type Vote = typeof votes.$inferSelect
export type NewVote = typeof votes.$inferInsert
