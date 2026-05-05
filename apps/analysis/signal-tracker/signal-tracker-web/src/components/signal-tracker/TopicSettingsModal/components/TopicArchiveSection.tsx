import { useNavigate } from "@tanstack/react-router";

import { useArchiveTopicMutation } from "@/api";
import { Alert, Button, useDialogContext } from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

type TopicArchiveSectionProps = {
  topicId: string;
};

function TopicArchiveSection({ topicId }: TopicArchiveSectionProps) {
  const navigate = useNavigate();
  const { isDialogConfirming, runDialogConfirm } = useDialogContext();
  const [archiveTopic, { errorMessage }] = useArchiveTopicMutation();

  async function handleArchive() {
    const result = await runDialogConfirm(async () =>
      archiveTopic({ topicId }).unwrap()
    );

    if (result.ok) {
      await navigate({ to: appRoutes.listTopics.path });
    }
  }

  return (
    <section
      aria-labelledby="topic-settings-lifecycle-heading"
      className="border-border grid gap-3 border-t pt-5"
    >
      <div>
        <h2
          id="topic-settings-lifecycle-heading"
          className="text-sm font-semibold"
        >
          Lifecycle
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Archive hides this topic from the active topic flow without deleting
          its analytical history.
        </p>
      </div>
      {errorMessage ? (
        <Alert title="Unable to archive topic" variant="danger">
          {errorMessage}
        </Alert>
      ) : null}
      <Button
        isLoading={isDialogConfirming}
        loadingLabel="Archiving topic..."
        onClick={() => void handleArchive()}
        variant="outline"
      >
        Archive topic
      </Button>
    </section>
  );
}

export { TopicArchiveSection };
