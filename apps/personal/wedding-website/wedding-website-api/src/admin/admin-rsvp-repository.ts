import type { AdminRsvpSubmission } from "@repo/wedding-website-shared";

export interface AdminRsvpRepository {
  listSubmissions(): Promise<AdminRsvpSubmission[]>;
}

export class AdminRsvpReadUnavailableError extends Error {
  constructor() {
    super("RSVP admin read is unavailable.");
  }
}

export class InMemoryAdminRsvpRepository implements AdminRsvpRepository {
  readonly #submissions: AdminRsvpSubmission[];

  constructor(submissions: AdminRsvpSubmission[] = []) {
    this.#submissions = structuredClone(submissions);
  }

  async listSubmissions(): Promise<AdminRsvpSubmission[]> {
    return structuredClone(this.#submissions).sort((left, right) =>
      right.submittedAt.localeCompare(left.submittedAt)
    );
  }
}
