import { useState } from "react";
import { createFixture } from "./fixtures";
import { revisionConflicts, type Entry, type Revision } from "./model";

export function useWorkspace(stress: boolean) {
  const [fixture, setFixture] = useState(() => createFixture(stress));
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [message, setMessage] = useState("");

  const saveEntries = (name: string, next: Entry[]) => {
    const ids = new Set(next.map((entry) => entry.id));
    const before = fixture.entries.filter((entry) => ids.has(entry.id));
    const revision: Revision = {
      id: Date.now(),
      name,
      before,
      after: next,
      undone: false
    };
    setFixture({
      ...fixture,
      entries: [
        ...fixture.entries.filter((entry) => !ids.has(entry.id)),
        ...next
      ]
    });
    setRevisions([revision, ...revisions]);
    setMessage(`${name}. Saved in this session; linked views updated.`);
  };
  const undo = (revision: Revision) => {
    if (revision.undone) return;
    if (revisionConflicts(fixture.entries, revision)) {
      setMessage(
        "Cannot restore: an entry changed after this revision. Review its newer changes first."
      );
      return;
    }
    const ids = new Set(revision.after.map((entry) => entry.id));
    setFixture({
      ...fixture,
      entries: [
        ...fixture.entries.filter((entry) => !ids.has(entry.id)),
        ...revision.before
      ]
    });
    setRevisions(
      revisions.map((item) =>
        item.id === revision.id ? { ...item, undone: true } : item
      )
    );
    setMessage(`Restored the state before “${revision.name}”.`);
  };
  return {
    fixture,
    setFixture,
    revisions,
    message,
    setMessage,
    saveEntries,
    undo
  };
}
