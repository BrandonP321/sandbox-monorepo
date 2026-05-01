import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
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

export const entryAssessments = pgTable(
  "entry_assessments",
  {
    entryId: text("entry_id")
      .primaryKey()
      .references(() => entries.id),
    judgment: text("judgment").notNull(),
    confidenceLabel: text("confidence_label").notNull(),
    probabilityPct: integer("probability_pct"),
    assumptionsJson: jsonb("assumptions_json").notNull(),
    indicatorsJson: jsonb("indicators_json").notNull(),
    resolutionCriteria: text("resolution_criteria"),
    targetResolvesAt: timestamp("target_resolves_at", { withTimezone: true }),
    previousAssessmentEntryId: text("previous_assessment_entry_id").references(
      () => entries.id
    )
  },
  (table) => [
    index("entry_assessments_previous_idx").on(table.previousAssessmentEntryId),
    check(
      "entry_assessments_judgment_not_blank",
      sql`length(trim(${table.judgment})) > 0`
    ),
    check(
      "entry_assessments_confidence_label_valid",
      sql`${table.confidenceLabel} in ('low', 'medium', 'high')`
    ),
    check(
      "entry_assessments_probability_pct_valid",
      sql`${table.probabilityPct} is null or (${table.probabilityPct} >= 0 and ${table.probabilityPct} <= 100)`
    )
  ]
);

export const sources = pgTable(
  "sources",
  {
    id: text("id").primaryKey(),
    canonicalName: text("canonical_name").notNull(),
    baseUrl: text("base_url"),
    sourceType: text("source_type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
  },
  (table) => [
    index("sources_base_url_idx").on(table.baseUrl),
    index("sources_canonical_name_type_idx").on(
      table.canonicalName,
      table.sourceType
    ),
    check(
      "sources_canonical_name_not_blank",
      sql`length(trim(${table.canonicalName})) > 0`
    ),
    check(
      "sources_source_type_valid",
      sql`${table.sourceType} in ('news', 'government', 'court', 'academic', 'think_tank', 'organization', 'user_uploaded', 'other')`
    )
  ]
);

export const evidenceItems = pgTable(
  "evidence_items",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    canonicalUrl: text("canonical_url"),
    title: text("title").notNull(),
    author: text("author"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    contentType: text("content_type"),
    language: text("language"),
    snapshotHash: text("snapshot_hash"),
    storageKey: text("storage_key"),
    metadataJsonb: jsonb("metadata_jsonb").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
  },
  (table) => [
    index("evidence_items_source_idx").on(table.sourceId),
    uniqueIndex("evidence_items_canonical_url_unique")
      .on(table.canonicalUrl)
      .where(sql`${table.canonicalUrl} is not null`),
    check(
      "evidence_items_title_not_blank",
      sql`length(trim(${table.title})) > 0`
    )
  ]
);

export const evidenceAnchors = pgTable(
  "evidence_anchors",
  {
    id: text("id").primaryKey(),
    evidenceItemId: text("evidence_item_id")
      .notNull()
      .references(() => evidenceItems.id, { onDelete: "cascade" }),
    quoteText: text("quote_text"),
    prefix: text("prefix"),
    suffix: text("suffix"),
    pageLabel: text("page_label"),
    startPos: integer("start_pos"),
    endPos: integer("end_pos"),
    locatorJsonb: jsonb("locator_jsonb").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
  },
  (table) => [
    index("evidence_anchors_item_idx").on(table.evidenceItemId),
    index("evidence_anchors_item_created_idx").on(
      table.evidenceItemId,
      table.createdAt,
      table.id
    ),
    check(
      "evidence_anchors_locator_present",
      sql`${table.quoteText} is not null or ${table.pageLabel} is not null or (${table.startPos} is not null and ${table.endPos} is not null) or ${table.locatorJsonb} <> '{}'::jsonb`
    ),
    check(
      "evidence_anchors_position_pair",
      sql`(${table.startPos} is null and ${table.endPos} is null) or (${table.startPos} is not null and ${table.endPos} is not null)`
    ),
    check(
      "evidence_anchors_position_order",
      sql`${table.startPos} is null or ${table.endPos} is null or ${table.startPos} <= ${table.endPos}`
    )
  ]
);

export const signalTrackerSchema = {
  topics,
  entries,
  entryAssessments,
  sources,
  evidenceItems,
  evidenceAnchors
};
