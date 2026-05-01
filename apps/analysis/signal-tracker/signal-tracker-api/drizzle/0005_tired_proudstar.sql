CREATE TABLE "evidence_anchors" (
	"id" text PRIMARY KEY NOT NULL,
	"evidence_item_id" text NOT NULL,
	"quote_text" text,
	"prefix" text,
	"suffix" text,
	"page_label" text,
	"start_pos" integer,
	"end_pos" integer,
	"locator_jsonb" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "evidence_anchors_locator_present" CHECK ("evidence_anchors"."quote_text" is not null or "evidence_anchors"."page_label" is not null or ("evidence_anchors"."start_pos" is not null and "evidence_anchors"."end_pos" is not null) or "evidence_anchors"."locator_jsonb" <> '{}'::jsonb),
	CONSTRAINT "evidence_anchors_position_pair" CHECK (("evidence_anchors"."start_pos" is null and "evidence_anchors"."end_pos" is null) or ("evidence_anchors"."start_pos" is not null and "evidence_anchors"."end_pos" is not null)),
	CONSTRAINT "evidence_anchors_position_order" CHECK ("evidence_anchors"."start_pos" is null or "evidence_anchors"."end_pos" is null or "evidence_anchors"."start_pos" <= "evidence_anchors"."end_pos")
);
--> statement-breakpoint
ALTER TABLE "evidence_anchors" ADD CONSTRAINT "evidence_anchors_evidence_item_id_evidence_items_id_fk" FOREIGN KEY ("evidence_item_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_anchors_item_idx" ON "evidence_anchors" USING btree ("evidence_item_id");--> statement-breakpoint
CREATE INDEX "evidence_anchors_item_created_idx" ON "evidence_anchors" USING btree ("evidence_item_id","created_at","id");