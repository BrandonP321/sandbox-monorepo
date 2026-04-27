CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"framing_question" text NOT NULL,
	"scope_note" text,
	"review_cadence" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "topics_title_not_blank" CHECK (length(trim("topics"."title")) > 0),
	CONSTRAINT "topics_framing_question_not_blank" CHECK (length(trim("topics"."framing_question")) > 0),
	CONSTRAINT "topics_review_cadence_valid" CHECK ("topics"."review_cadence" in ('weekly', 'biweekly', 'monthly', 'ad_hoc')),
	CONSTRAINT "topics_status_active" CHECK ("topics"."status" = 'active')
);
