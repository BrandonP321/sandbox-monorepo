import { Settings } from "lucide-react";
import type { Topic } from "@repo/signal-tracker-shared";

import { Button, Dialog, DialogTrigger } from "@/components/ui";

import { TopicSettingsModalContent } from "./components";

type TopicSettingsModalProps = {
  topic: Topic;
};

function TopicSettingsModal({ topic }: TopicSettingsModalProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <Settings aria-hidden="true" className="size-4" />
          Topic settings
        </Button>
      </DialogTrigger>
      <TopicSettingsModalContent topic={topic} />
    </Dialog>
  );
}

export { TopicSettingsModal };
