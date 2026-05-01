CREATE TABLE "entry_citations" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"evidence_item_id" text NOT NULL,
	"evidence_anchor_id" text,
	"relation_type" text DEFAULT 'supports' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "entry_citations_relation_type_valid" CHECK ("entry_citations"."relation_type" in ('supports', 'contradicts', 'contextualizes', 'source_for')),
	CONSTRAINT "entry_citations_note_not_blank" CHECK ("entry_citations"."note" is null or length(trim("entry_citations"."note")) > 0)
);
--> statement-breakpoint
ALTER TABLE "entry_citations" ADD CONSTRAINT "entry_citations_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_citations" ADD CONSTRAINT "entry_citations_evidence_item_id_evidence_items_id_fk" FOREIGN KEY ("evidence_item_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_citations" ADD CONSTRAINT "entry_citations_evidence_anchor_id_evidence_anchors_id_fk" FOREIGN KEY ("evidence_anchor_id") REFERENCES "public"."evidence_anchors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_citations_entry_created_idx" ON "entry_citations" USING btree ("entry_id","created_at","id");--> statement-breakpoint
CREATE INDEX "entry_citations_evidence_item_idx" ON "entry_citations" USING btree ("evidence_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_citations_item_unique" ON "entry_citations" USING btree ("entry_id","evidence_item_id","relation_type") WHERE "entry_citations"."evidence_anchor_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "entry_citations_anchor_unique" ON "entry_citations" USING btree ("entry_id","evidence_item_id","evidence_anchor_id","relation_type") WHERE "entry_citations"."evidence_anchor_id" is not null;