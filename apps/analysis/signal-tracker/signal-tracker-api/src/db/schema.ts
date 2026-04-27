import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const topics = pgTable(
  "topics",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    framingQuestion: text("framing_question").notNull(),
    scopeNote: text("scope_note"),
    reviewCadence: text("review_cadence").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
  },
  (table) => [
    check("topics_title_not_blank", sql`length(trim(${table.title})) > 0`),
    check(
      "topics_framing_question_not_blank",
      sql`length(trim(${table.framingQuestion})) > 0`
    ),
    check(
      "topics_review_cadence_valid",
      sql`${table.reviewCadence} in ('weekly', 'biweekly', 'monthly', 'ad_hoc')`
    ),
    check("topics_status_active", sql`${table.status} = 'active'`)
  ]
);

export const signalTrackerSchema = { topics };
