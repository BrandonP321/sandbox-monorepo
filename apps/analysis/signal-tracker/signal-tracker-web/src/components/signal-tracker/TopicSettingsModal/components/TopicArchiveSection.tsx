import { useNavigate } from "@tanstack/react-router";
import { isSignalTrackerProtectedDemoTopicId } from "@repo/signal-tracker-shared";
import { ErrorNotificationProvider } from "@repo/ui-base/notifications";

import { useArchiveTopicMutation } from "@/api";
import {
  Button,
  ContentHeader,
  NotificationAlerts,
  useDialogContext
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";
import { useTopicSettingsModalContext } from "../hooks";

function TopicArchiveSection() {
  return (
    <ErrorNotificationProvider>
      <TopicArchiveSectionContent />
    </ErrorNotificationProvider>
  );
}

function TopicArchiveSectionContent() {
  const { topicId } = useTopicSettingsModalContext();

  if (isSignalTrackerProtectedDemoTopicId(topicId)) {
    return <ProtectedDemoTopicArchiveSection />;
  }

  return <TopicArchiveSectionControls topicId={topicId} />;
}

type TopicArchiveSectionControlsProps = {
  topicId: string;
};

function TopicArchiveSectionControls({
  topicId
}: TopicArchiveSectionControlsProps) {
  const navigate = useNavigate();
  const { isDialogConfirming, runDialogConfirm } = useDialogContext();
  const [archiveTopic] = useArchiveTopicMutation();

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
      <Button
        isLoading={isDialogConfirming}
        loadingLabel="Archiving topic..."
        onClick={() => void handleArchive()}
        variant="outline"
      >
        Archive topic
      </Button>
      <NotificationAlerts />
    </section>
  );
}

function ProtectedDemoTopicArchiveSection() {
  return (
    <section className="border-border grid gap-3 border-t pt-5">
      <ContentHeader
        description="Archive hides this topic from the active topic flow without deleting its analytical history."
        headingLevel={2}
        headingSize="h5"
        title="Lifecycle"
      />
      <Button disabled variant="outline">
        Archive topic
      </Button>
      <p className="text-muted-foreground text-sm">
        Archiving is temporarily disabled for this demo topic.
      </p>
    </section>
  );
}

export { TopicArchiveSection };
