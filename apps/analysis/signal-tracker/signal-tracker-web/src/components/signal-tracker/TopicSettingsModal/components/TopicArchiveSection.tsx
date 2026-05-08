import { useNavigate } from "@tanstack/react-router";

import { useArchiveTopicMutation } from "@/api";
import {
  Alert,
  Button,
  ContentHeader,
  useDialogContext
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";
import { useTopicSettingsModalContext } from "../hooks";

function TopicArchiveSection() {
  const navigate = useNavigate();
  const { topicId } = useTopicSettingsModalContext();
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
    <section className="border-border grid gap-3 border-t pt-5">
      <ContentHeader
        description="Archive hides this topic from the active topic flow without deleting its analytical history."
        headingLevel={2}
        headingSize="h5"
        title="Lifecycle"
      />
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
