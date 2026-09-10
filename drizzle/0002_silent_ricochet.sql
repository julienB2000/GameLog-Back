ALTER TABLE "games" ADD COLUMN "external_id" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "genres" text[];--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "metacritic_rating" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "popularity" integer;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_external_id_unique" UNIQUE("external_id");