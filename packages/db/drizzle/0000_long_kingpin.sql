CREATE TYPE "public"."permission" AS ENUM('all_players', 'host_only');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('pending', 'voting', 'revealed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."voting_system" AS ENUM('fibonacci', 't_shirt', 'powers_of_two', 'sequential', 'custom');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"voting_system" "voting_system" DEFAULT 'fibonacci' NOT NULL,
	"custom_deck" jsonb,
	"who_can_reveal" "permission" DEFAULT 'all_players' NOT NULL,
	"who_can_manage_issues" "permission" DEFAULT 'all_players' NOT NULL,
	"auto_reveal" boolean DEFAULT false NOT NULL,
	"fun_features" boolean DEFAULT true NOT NULL,
	"show_average" boolean DEFAULT true NOT NULL,
	"show_countdown" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" text NOT NULL,
	"session_token" text NOT NULL,
	"is_host" boolean DEFAULT false NOT NULL,
	"is_spectator" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"status" "story_status" DEFAULT 'pending' NOT NULL,
	"final_estimate" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_story_player_vote" UNIQUE("story_id","player_id")
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;