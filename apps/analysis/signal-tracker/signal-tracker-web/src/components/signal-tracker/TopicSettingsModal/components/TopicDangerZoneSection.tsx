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
    <section
      aria-labelledby="topic-settings-delete-heading"
      className="border-danger/30 bg-danger/5 grid gap-3 rounded-md border p-4"
    >
      <div>
        <h2
          id="topic-settings-delete-heading"
          className="text-sm font-semibold"
        >
          Danger zone
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Delete permanently removes this topic. Use archive when you only want
          to remove it from active work.
        </p>
      </div>
      <TopicDeleteConfirmation topicId={topicId} topicTitle={topicTitle} />
    </section>
  );
}

export { TopicDangerZoneSection };
