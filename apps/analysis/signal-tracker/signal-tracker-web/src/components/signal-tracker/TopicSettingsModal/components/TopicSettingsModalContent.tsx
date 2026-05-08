import { DialogContent } from "@/components/ui";

import { TopicArchiveSection } from "./TopicArchiveSection";
import { TopicDangerZoneSection } from "./TopicDangerZoneSection";
import { TopicMetadataSection } from "./TopicMetadataSection";

function TopicSettingsModalContent() {
  return (
    <DialogContent
      className="max-w-2xl"
      description="Edit lower-frequency topic details and lifecycle settings without cluttering the topic workspace."
      title="Topic settings"
    >
      <div className="grid gap-6">
        <TopicMetadataSection />
        <TopicArchiveSection />
        <TopicDangerZoneSection />
      </div>
    </DialogContent>
  );
}

export { TopicSettingsModalContent };
