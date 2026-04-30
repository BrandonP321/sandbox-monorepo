import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";

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
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true })
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
    check(
      "topics_status_valid",
      sql`${table.status} in ('active', 'paused', 'archived')`
    )
  ]
);

export const entries = pgTable(
  "entries",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id),
    kind: text("kind").notNull(),
    epistemicStatus: text("epistemic_status").notNull(),
    title: text("title").notNull(),
    bodyMd: text("body_md").notNull(),
    sortAt: timestamp("sort_at", { withTimezone: true }).notNull(),
    isApproximateDate: boolean("is_approximate_date").notNull().default(false),
    originType: text("origin_type").notNull().default("manual"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => [
    index("entries_topic_sort_idx").on(table.topicId, table.sortAt),
    check("entries_title_not_blank", sql`length(trim(${table.title})) > 0`),
    check("entries_body_md_not_blank", sql`length(trim(${table.bodyMd})) > 0`),
    check(
      "entries_kind_valid",
      sql`${table.kind} in ('event', 'assessment', 'review')`
    ),
    check(
      "entries_epistemic_status_valid",
      sql`${table.epistemicStatus} in ('observed', 'reported', 'inferred', 'forecast')`
    ),
    check(
      "entries_origin_type_valid",
      sql`${table.originType} in ('manual', 'import', 'ai_suggestion')`
    ),
    check(
      "entries_status_valid",
      sql`${table.status} in ('active', 'archived', 'deleted')`
    )
  ]
);

export const signalTrackerSchema = { topics, entries };
