import {
  entryReadModelSchema,
  type AssessmentUpdate,
  type AssessmentUpdateReadModel,
  type Entry,
  type EntryReadModel
} from "@repo/signal-tracker-shared";

import type { EntrySourceSummaryRepository } from "./entry-source-summary-repository";

export async function hydrateEntryReadModel(
  entry: Entry,
  sourceSummaryRepository: EntrySourceSummaryRepository
): Promise<EntryReadModel> {
  const [hydratedEntry] = await hydrateEntryReadModels(
    [entry],
    sourceSummaryRepository
  );

  if (!hydratedEntry) {
    throw new Error("Entry hydration did not return the requested entry");
  }

  return hydratedEntry;
}

export async function hydrateEntryReadModels(
  entries: Entry[],
  sourceSummaryRepository: EntrySourceSummaryRepository
): Promise<EntryReadModel[]> {
  const summariesByEntryId = await sourceSummaryRepository.listByEntryIds(
    entries.map((entry) => entry.id)
  );

  return entries.map((entry) =>
    entryReadModelSchema.parse({
      ...entry,
      sources: summariesByEntryId.get(entry.id) ?? []
    })
  );
}

export async function hydrateAssessmentUpdateReadModel(
  assessmentUpdate: AssessmentUpdate,
  sourceSummaryRepository: EntrySourceSummaryRepository
): Promise<AssessmentUpdateReadModel> {
  const entry = await hydrateEntryReadModel(
    assessmentUpdate.entry,
    sourceSummaryRepository
  );

  return {
    ...assessmentUpdate,
    entry
  };
}

export async function hydrateAssessmentUpdateReadModels(
  assessmentUpdates: AssessmentUpdate[],
  sourceSummaryRepository: EntrySourceSummaryRepository
): Promise<AssessmentUpdateReadModel[]> {
  const entries = await hydrateEntryReadModels(
    assessmentUpdates.map((assessmentUpdate) => assessmentUpdate.entry),
    sourceSummaryRepository
  );
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  return assessmentUpdates.map((assessmentUpdate) => {
    const entry = entriesById.get(assessmentUpdate.entry.id);

    if (!entry) {
      throw new Error("Assessment entry hydration did not return an entry");
    }

    return {
      ...assessmentUpdate,
      entry
    };
  });
}
