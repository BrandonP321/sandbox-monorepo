import type { Entry } from "@repo/signal-tracker-shared";

export type ListEntriesByTopicOptions = {
  includeArchived?: boolean;
  includeDeleted?: boolean;
};

export type EntryRepository = {
  create(entry: Entry): Promise<Entry>;
  findById(id: string): Promise<Entry | undefined>;
  listByTopic(
    topicId: string,
    options?: ListEntriesByTopicOptions
  ): Promise<Entry[]>;
};

export class InMemoryEntryRepository implements EntryRepository {
  private readonly entries = new Map<string, Entry>();

  async create(entry: Entry): Promise<Entry> {
    this.entries.set(entry.id, entry);
    return entry;
  }

  async findById(id: string): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async listByTopic(
    topicId: string,
    options: ListEntriesByTopicOptions = {}
  ): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter((entry) => entry.topicId === topicId)
      .filter((entry) => {
        if (entry.status === "archived") {
          return options.includeArchived === true;
        }

        if (entry.status === "deleted") {
          return options.includeDeleted === true;
        }

        return entry.status === "active";
      })
      .sort(compareEntriesForList);
  }
}

function compareEntriesForList(left: Entry, right: Entry): number {
  const sortAtComparison = right.sortAt.localeCompare(left.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison = right.createdAt.localeCompare(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}
