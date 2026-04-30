import type { AssessmentRepository } from "../domain/assessments/assessment-repository";
import { PostgresAssessmentRepository } from "../domain/assessments/postgres-assessment-repository";
import type { EntryRepository } from "../domain/entries/entry-repository";
import { PostgresEntryRepository } from "../domain/entries/postgres-entry-repository";
import { PostgresTopicRepository } from "../domain/topics/postgres-topic-repository";
import type { TopicRepository } from "../domain/topics/topic-repository";

export type SignalTrackerApiDependencies = {
  topicRepository: TopicRepository;
  entryRepository: EntryRepository;
  assessmentRepository: AssessmentRepository;
  createId?: () => string;
  generateId?: () => string;
  now?: () => Date;
};

export function createSignalTrackerApiDependencies(): SignalTrackerApiDependencies {
  const topicRepository = new PostgresTopicRepository();

  return {
    topicRepository,
    entryRepository: new PostgresEntryRepository(),
    assessmentRepository: new PostgresAssessmentRepository()
  };
}
