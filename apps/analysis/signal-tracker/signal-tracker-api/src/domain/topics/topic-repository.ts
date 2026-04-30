import type { Topic } from "@repo/signal-tracker-shared";

export type ListTopicsOptions = {
  query?: string;
};

export type TopicRepository = {
  create(topic: Topic): Promise<Topic>;
  findById(id: string): Promise<Topic | undefined>;
  list(options?: ListTopicsOptions): Promise<Topic[]>;
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
