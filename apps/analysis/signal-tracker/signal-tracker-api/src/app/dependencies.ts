import type { AssessmentRepository } from "../domain/assessments/assessment-repository";
import { PostgresAssessmentRepository } from "../domain/assessments/postgres-assessment-repository";
import type { EntryCitationRepository } from "../domain/citations/entry-citation-repository";
import { PostgresEntryCitationRepository } from "../domain/citations/postgres-entry-citation-repository";
import type { EntryRepository } from "../domain/entries/entry-repository";
import { PostgresEntryRepository } from "../domain/entries/postgres-entry-repository";
import type { EvidenceAnchorRepository } from "../domain/evidence/evidence-anchor-repository";
import type { EvidenceRepository } from "../domain/evidence/evidence-repository";
import { PostgresEvidenceAnchorRepository } from "../domain/evidence/postgres-evidence-anchor-repository";
import { PostgresEvidenceRepository } from "../domain/evidence/postgres-evidence-repository";
import { PostgresTopicRepository } from "../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../domain/topics/topic-repository";

export type SignalTrackerApiDependencies = {
  topicRepository: TopicRepository;
  entryRepository: EntryRepository;
  assessmentRepository: AssessmentRepository;
  entryCitationRepository: EntryCitationRepository;
  evidenceRepository: EvidenceRepository;
  evidenceAnchorRepository: EvidenceAnchorRepository;
  createId?: () => string;
  generateId?: () => string;
  now?: () => Date;
};

export function createSignalTrackerApiDependencies(): SignalTrackerApiDependencies {
  const topicRepository = new PostgresTopicRepository();

  return {
    topicRepository,
    entryRepository: new PostgresEntryRepository(),
    assessmentRepository: new PostgresAssessmentRepository(),
    entryCitationRepository: new PostgresEntryCitationRepository(),
    evidenceRepository: new PostgresEvidenceRepository(),
    evidenceAnchorRepository: new PostgresEvidenceAnchorRepository()
  };
}
