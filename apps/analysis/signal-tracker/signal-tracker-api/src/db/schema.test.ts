import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { entries, entryAssessments } from "./schema";

describe("database schema relationships", () => {
  it("allows permanent topic delete to remove topic-owned entries", () => {
    expect(
      getForeignKeyDeleteAction(entries, "entries_topic_id_topics_id_fk")
    ).toBe("cascade");
    expect(
      getForeignKeyDeleteAction(
        entryAssessments,
        "entry_assessments_entry_id_entries_id_fk"
      )
    ).toBe("cascade");
    expect(
      getForeignKeyDeleteAction(
        entryAssessments,
        "entry_assessments_previous_assessment_entry_id_entries_id_fk"
      )
    ).toBe("set null");
  });
});

function getForeignKeyDeleteAction(
  table: Parameters<typeof getTableConfig>[0],
  foreignKeyName: string
): string | undefined {
  return getTableConfig(table).foreignKeys.find(
    (foreignKey) => foreignKey.getName() === foreignKeyName
  )?.onDelete;
}
