ALTER TABLE "topics" DROP CONSTRAINT "topics_status_active";--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_status_valid" CHECK ("topics"."status" in ('active', 'paused', 'archived'));