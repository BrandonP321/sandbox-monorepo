import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { Dialog, DialogContent } from "@/components/ui";

import { EntrySourceManagerForm } from "./components";
import { getEntrySourceManagerFormKey } from "./lib/form-key";

type EntrySourceManagerDialogProps = {
  entryId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  sources: AttachedSourceSummary[];
};

function EntrySourceManagerDialog({
  entryId,
  onOpenChange,
  open,
  sources
}: EntrySourceManagerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        description="Edit the source URL list attached to this entry."
        title="Manage sources"
      >
        {open ? (
          <EntrySourceManagerForm
            entryId={entryId}
            key={getEntrySourceManagerFormKey(entryId, sources)}
            sources={sources}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { EntrySourceManagerDialog, type EntrySourceManagerDialogProps };
