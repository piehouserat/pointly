ALTER TABLE "players" RENAME TO "participants";--> statement-breakpoint
ALTER TABLE "games" RENAME TO "rooms";--> statement-breakpoint
ALTER TABLE "participants" RENAME COLUMN "game_id" TO "room_id";--> statement-breakpoint
ALTER TABLE "stories" RENAME COLUMN "game_id" TO "room_id";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "player_id" TO "participant_id";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "unique_story_player_vote";--> statement-breakpoint
ALTER TABLE "participants" DROP CONSTRAINT "players_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" DROP CONSTRAINT "stories_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "unique_story_participant_vote" UNIQUE("story_id","participant_id");