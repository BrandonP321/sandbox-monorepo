CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"kind" text NOT NULL,
	"epistemic_status" text NOT NULL,
	"title" text NOT NULL,
	"body_md" text NOT NULL,
	"sort_at" timestamp with time zone NOT NULL,
	"is_approximate_date" boolean DEFAULT false NOT NULL,
	"origin_type" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "entries_title_not_blank" CHECK (length(trim("entries"."title")) > 0),
	CONSTRAINT "entries_body_md_not_blank" CHECK (length(trim("entries"."body_md")) > 0),
	CONSTRAINT "entries_kind_valid" CHECK ("entries"."kind" in ('event', 'assessment', 'review')),
	CONSTRAINT "entries_epistemic_status_valid" CHECK ("entries"."epistemic_status" in ('observed', 'reported', 'inferred', 'forecast')),
	CONSTRAINT "entries_origin_type_valid" CHECK ("entries"."origin_type" in ('manual', 'import', 'ai_suggestion')),
	CONSTRAINT "entries_status_valid" CHECK ("entries"."status" in ('active', 'archived', 'deleted'))
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entries_topic_sort_idx" ON "entries" USING btree ("topic_id","sort_at");