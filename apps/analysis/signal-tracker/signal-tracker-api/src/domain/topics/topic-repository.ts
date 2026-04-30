import type { Topic, UpdateTopicRequest } from "@repo/signal-tracker-shared";

export type ListTopicsOptions = {
  query?: string;
};

export type UpdateTopicFields = Omit<UpdateTopicRequest, "topicId">;

export type TopicRepository = {
  create(topic: Topic): Promise<Topic>;
  findById(id: string): Promise<Topic | undefined>;
  list(options?: ListTopicsOptions): Promise<Topic[]>;
  update(
    id: string,
    updates: UpdateTopicFields,
    updatedAt: string
  ): Promise<Topic | undefined>;
  archive(id: string, archivedAt: string): Promise<Topic | undefined>;
  // Topic delete is intentionally a hard delete; archive is the reversible path.
  delete(id: string): Promise<Topic | undefined>;
};

export class InMemoryTopicRepository implements TopicRepository {
  private readonly topics = new Map<string, Topic>();

  async create(topic: Topic): Promise<Topic> {
    this.topics.set(topic.id, topic);
    return topic;
  }

  async findById(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async list(options: ListTopicsOptions = {}): Promise<Topic[]> {
    const query = options.query?.toLocaleLowerCase();

    return Array.from(this.topics.values())
      .filter((topic) => topic.status === "active")
      .filter((topic) => {
        if (!query) {
          return true;
        }

        return [topic.title, topic.framingQuestion, topic.scopeNote ?? ""].some(
          (value) => value.toLocaleLowerCase().includes(query)
        );
      })
      .sort(compareTopicsForList);
  }

  async update(
    id: string,
    updates: UpdateTopicFields,
    updatedAt: string
  ): Promise<Topic | undefined> {
    const existingTopic = await this.findById(id);

    if (!existingTopic) {
      return undefined;
    }

    const updatedTopic: Topic = {
      ...existingTopic,
      ...mapTopicUpdates(updates),
      updatedAt
    };

    this.topics.set(id, updatedTopic);

    return updatedTopic;
  }

  async archive(id: string, archivedAt: string): Promise<Topic | undefined> {
    const existingTopic = await this.findById(id);

    if (!existingTopic) {
      return undefined;
    }

    const archivedTopic: Topic = {
      ...existingTopic,
      status: "archived",
      archivedAt,
      updatedAt: archivedAt
    };

    this.topics.set(id, archivedTopic);

    return archivedTopic;
  }

  async delete(id: string): Promise<Topic | undefined> {
    const existingTopic = await this.findById(id);

    if (!existingTopic) {
      return undefined;
    }

    this.topics.delete(id);

    return existingTopic;
  }
}

function compareTopicsForList(left: Topic, right: Topic): number {
  const updatedAtComparison = right.updatedAt.localeCompare(left.updatedAt);

  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  const createdAtComparison = right.createdAt.localeCompare(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}

function mapTopicUpdates(updates: UpdateTopicFields): Partial<Topic> {
  const topicUpdates: Partial<Topic> = {};

  if (updates.title !== undefined) {
    topicUpdates.title = updates.title;
  }

  if (updates.framingQuestion !== undefined) {
    topicUpdates.framingQuestion = updates.framingQuestion;
  }

  if (updates.scopeNote !== undefined) {
    topicUpdates.scopeNote = updates.scopeNote ?? undefined;
  }

  if (updates.reviewCadence !== undefined) {
    topicUpdates.reviewCadence = updates.reviewCadence;
  }

  return topicUpdates;
}
