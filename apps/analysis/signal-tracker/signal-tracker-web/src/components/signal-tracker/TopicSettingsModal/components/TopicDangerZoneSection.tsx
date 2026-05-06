import { ContentHeader } from "@/components/ui";

import { TopicDeleteConfirmation } from "./TopicDeleteConfirmation";

type TopicDangerZoneSectionProps = {
  topicId: string;
  topicTitle: string;
};

function TopicDangerZoneSection({
  topicId,
  topicTitle
}: TopicDangerZoneSectionProps) {
  return (
    <section className="border-danger/30 bg-danger/5 grid gap-3 rounded-md border p-4">
      <ContentHeader
        description="Delete permanently removes this topic. Use archive when you only want to remove it from active work."
        headingLevel={2}
        headingSize="h5"
        title="Danger zone"
      />
      <TopicDeleteConfirmation topicId={topicId} topicTitle={topicTitle} />
    </section>
  );
}

export { TopicDangerZoneSection };
