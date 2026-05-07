import type { AssessmentRepository } from "../domain/assessments/assessment-repository";
import {
  DrizzleAssessmentRowStore,
  PostgresAssessmentRepository
} from "../domain/assessments/postgres-assessment-repository";
import type { EntryCitationRepository } from "../domain/citations/entry-citation-repository";
import {
  DrizzleEntryCitationRowStore,
  PostgresEntryCitationRepository
} from "../domain/citations/postgres-entry-citation-repository";
import type { EntryRepository } from "../domain/entries/entry-repository";
import type { EntrySourceSummaryRepository } from "../domain/entries/entry-source-summary-repository";
import {
  DrizzleEntryRowStore,
  PostgresEntryRepository
} from "../domain/entries/postgres-entry-repository";
import {
  DrizzleEntrySourceSummaryRowStore,
  PostgresEntrySourceSummaryRepository
} from "../domain/entries/postgres-entry-source-summary-repository";
import type { EvidenceAnchorRepository } from "../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../domain/evidence/evidence-repository";
import {
  DrizzleEvidenceAnchorRowStore,
  PostgresEvidenceAnchorRepository
} from "../domain/evidence/postgres-evidence-anchor-repository";
import {
  DrizzleEvidenceRowStore,
  PostgresEvidenceRepository
} from "../domain/evidence/postgres-evidence-repository";
import {
  DrizzleTopicRowStore,
  PostgresTopicRepository
} from "../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../domain/topics/topic-repository";
import { getRuntimeDatabase, type SignalTrackerDb } from "../db/client";

export type SignalTrackerApiDependencies = {
  topicRepository: TopicRepository;
  entryRepository: EntryRepository;
  entrySourceSummaryRepository: EntrySourceSummaryRepository;
  assessmentRepository: AssessmentRepository;
  entryCitationRepository: EntryCitationRepository;
  evidenceRepository: EvidenceRepository;
  evidenceAnchorRepository: EvidenceAnchorRepository;
  createId?: () => string;
  generateId?: () => string;
  now?: () => Date;
  runInTransaction?: <T>(
    operation: (dependencies: SignalTrackerApiDependencies) => Promise<T>
  ) => Promise<T>;
};

export function createSignalTrackerApiDependencies(): SignalTrackerApiDependencies {
  return createPostgresDependenciesForDatabase(getRuntimeDatabase, {
    runInTransaction: async (operation) =>
      getRuntimeDatabase().transaction(async (tx) =>
        operation(
          createPostgresDependenciesForDatabase(
            () => tx as unknown as SignalTrackerDb
          )
        )
      )
  });
}

function createPostgresDependenciesForDatabase(
  getDatabase: () => SignalTrackerDb,
  extras: Pick<SignalTrackerApiDependencies, "runInTransaction"> = {}
): SignalTrackerApiDependencies {
  return {
    topicRepository: new PostgresTopicRepository(
      new DrizzleTopicRowStore(getDatabase)
    ),
    entryRepository: new PostgresEntryRepository(
      new DrizzleEntryRowStore(getDatabase)
    ),
    entrySourceSummaryRepository: new PostgresEntrySourceSummaryRepository(
      new DrizzleEntrySourceSummaryRowStore(getDatabase)
    ),
    assessmentRepository: new PostgresAssessmentRepository(
      new DrizzleAssessmentRowStore(getDatabase)
    ),
    entryCitationRepository: new PostgresEntryCitationRepository(
      new DrizzleEntryCitationRowStore(getDatabase)
    ),
    evidenceRepository: new PostgresEvidenceRepository(
      new DrizzleEvidenceRowStore(getDatabase)
    ),
    evidenceAnchorRepository: new PostgresEvidenceAnchorRepository(
      new DrizzleEvidenceAnchorRowStore(getDatabase)
    ),
    ...extras
  };
}
