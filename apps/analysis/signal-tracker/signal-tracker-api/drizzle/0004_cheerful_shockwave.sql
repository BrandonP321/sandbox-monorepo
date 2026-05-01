CREATE TABLE "evidence_items" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"canonical_url" text,
	"title" text NOT NULL,
	"author" text,
	"published_at" timestamp with time zone,
	"captured_at" timestamp with time zone NOT NULL,
	"content_type" text,
	"language" text,
	"snapshot_hash" text,
	"storage_key" text,
	"metadata_jsonb" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "evidence_items_title_not_blank" CHECK (length(trim("evidence_items"."title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"base_url" text,
	"source_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sources_canonical_name_not_blank" CHECK (length(trim("sources"."canonical_name")) > 0),
	CONSTRAINT "sources_source_type_valid" CHECK ("sources"."source_type" in ('news', 'government', 'court', 'academic', 'think_tank', 'organization', 'user_uploaded', 'other'))
);
--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_items_source_idx" ON "evidence_items" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_items_canonical_url_unique" ON "evidence_items" USING btree ("canonical_url") WHERE "evidence_items"."canonical_url" is not null;--> statement-breakpoint
CREATE INDEX "sources_base_url_idx" ON "sources" USING btree ("base_url");--> statement-breakpoint
CREATE INDEX "sources_canonical_name_type_idx" ON "sources" USING btree ("canonical_name","source_type");