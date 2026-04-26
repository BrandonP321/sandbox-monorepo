import type { Topic } from "@repo/signal-tracker-shared";

export type TopicRepository = {
  create(topic: Topic): Promise<Topic>;
};

export class InMemoryTopicRepository implements TopicRepository {
  private readonly topics = new Map<string, Topic>();

  async create(topic: Topic): Promise<Topic> {
    this.topics.set(topic.id, topic);
    return topic;
  }
}
