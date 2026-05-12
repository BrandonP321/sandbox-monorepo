import type { Topic } from "@repo/signal-tracker-shared";

import { Button, Dialog, DialogTrigger } from "@/components/ui";

import { signalTrackerIcons as Icons } from "../signalTrackerIcons";
import { TopicSettingsModalContent } from "./components";
import { TopicSettingsModalProvider } from "./context";

type TopicSettingsModalProps = {
  topic: Topic;
};

function TopicSettingsModal({ topic }: TopicSettingsModalProps) {
  return (
    <Dialog>
      <TopicSettingsModalProvider topic={topic}>
        <DialogTrigger>
          <Button
            iconLeft={<Icons.settings aria-hidden="true" className="size-4" />}
            variant="outline"
          >
            Topic settings
          </Button>
        </DialogTrigger>
        <TopicSettingsModalContent />
      </TopicSettingsModalProvider>
    </Dialog>
  );
}

export { TopicSettingsModal };
