import type { Topic } from "@repo/signal-tracker-shared";

export type TopicRepository = {
  create(topic: Topic): Promise<Topic>;
  findById(id: string): Promise<Topic | undefined>;
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
}
