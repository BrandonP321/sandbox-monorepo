import type { EntryReadModel } from "@repo/signal-tracker-shared";

import { Dialog, DialogContent } from "@/components/ui";

import { EventEntryForm } from "./components/EventEntryForm";

type EventEntryComposerProps = {
  entry?: EntryReadModel | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  topicId: string;
};

function EventEntryComposer({
  entry,
  onOpenChange,
  open,
  topicId
}: EventEntryComposerProps) {
  const isEditing = entry !== undefined && entry !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        description="Record what happened, when it happened, and how directly the claim is known."
        title={isEditing ? "Edit event" : "Add event"}
      >
        <EventEntryForm
          entry={entry ?? null}
          key={entry?.id ?? "new"}
          topicId={topicId}
        />
      </DialogContent>
    </Dialog>
  );
}

export { EventEntryComposer, type EventEntryComposerProps };
