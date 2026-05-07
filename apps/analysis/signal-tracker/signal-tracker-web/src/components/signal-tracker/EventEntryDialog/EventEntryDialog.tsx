import type { EntryReadModel } from "@repo/signal-tracker-shared";
import type { ReactElement } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui";

import { EventEntryForm } from "../EventEntryForm";

type EventEntryDialogProps = {
  children: ReactElement;
  entry?: EntryReadModel | null;
  topicId: string;
};

function EventEntryDialog({ children, entry, topicId }: EventEntryDialogProps) {
  const isEditing = entry !== undefined && entry !== null;

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
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

export { EventEntryDialog };
