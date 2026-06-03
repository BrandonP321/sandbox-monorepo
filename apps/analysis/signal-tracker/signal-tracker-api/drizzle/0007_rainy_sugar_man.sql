ALTER TABLE "entries" DROP CONSTRAINT "entries_topic_id_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "entry_assessments" DROP CONSTRAINT "entry_assessments_entry_id_entries_id_fk";
--> statement-breakpoint
ALTER TABLE "entry_assessments" DROP CONSTRAINT "entry_assessments_previous_assessment_entry_id_entries_id_fk";
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_assessments" ADD CONSTRAINT "entry_assessments_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_assessments" ADD CONSTRAINT "entry_assessments_previous_assessment_entry_id_entries_id_fk" FOREIGN KEY ("previous_assessment_entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;