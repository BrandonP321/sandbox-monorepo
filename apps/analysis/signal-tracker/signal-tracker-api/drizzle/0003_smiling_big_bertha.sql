CREATE TABLE "entry_assessments" (
	"entry_id" text PRIMARY KEY NOT NULL,
	"judgment" text NOT NULL,
	"confidence_label" text NOT NULL,
	"probability_pct" integer,
	"assumptions_json" jsonb NOT NULL,
	"indicators_json" jsonb NOT NULL,
	"resolution_criteria" text,
	"target_resolves_at" timestamp with time zone,
	"previous_assessment_entry_id" text,
	CONSTRAINT "entry_assessments_judgment_not_blank" CHECK (length(trim("entry_assessments"."judgment")) > 0),
	CONSTRAINT "entry_assessments_confidence_label_valid" CHECK ("entry_assessments"."confidence_label" in ('low', 'medium', 'high')),
	CONSTRAINT "entry_assessments_probability_pct_valid" CHECK ("entry_assessments"."probability_pct" is null or ("entry_assessments"."probability_pct" >= 0 and "entry_assessments"."probability_pct" <= 100))
);
--> statement-breakpoint
ALTER TABLE "entry_assessments" ADD CONSTRAINT "entry_assessments_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_assessments" ADD CONSTRAINT "entry_assessments_previous_assessment_entry_id_entries_id_fk" FOREIGN KEY ("previous_assessment_entry_id") REFERENCES "public"."entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_assessments_previous_idx" ON "entry_assessments" USING btree ("previous_assessment_entry_id");