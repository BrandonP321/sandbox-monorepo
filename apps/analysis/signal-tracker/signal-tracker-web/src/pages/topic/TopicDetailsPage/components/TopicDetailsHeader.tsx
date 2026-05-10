import { ArrowLeft, Plus } from "lucide-react";
import type { Topic } from "@repo/signal-tracker-shared";

import {
  EventEntryDialog,
  TopicSettingsModal
} from "@/components/signal-tracker";
import { Badge, Button, ButtonLink, ContentHeader } from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

type TopicDetailsHeaderProps = {
  topic: Topic;
};

// TODO: Update ContentHeader to include eyebrow and badge slots
function TopicDetailsHeader({ topic }: TopicDetailsHeaderProps) {
  return (
    <header className="border-border border-b pb-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Topic workspace
          </p>
          {topic.status === "archived" ? (
            <Badge variant="outline">Archived</Badge>
          ) : null}
        </div>

        <ContentHeader
          actions={<TopicDetailsHeaderActions topic={topic} />}
          className="mt-2"
          description={topic.framingQuestion}
          headingLevel={1}
          renderDescription={({ children, className }) => (
            <p className={`${className} max-w-3xl`}>{children}</p>
          )}
          title={topic.title}
        />

        {topic.scopeNote ? (
          <p className="border-border text-muted-foreground mt-3 max-w-3xl border-l pl-3 text-sm">
            {topic.scopeNote}
          </p>
        ) : null}
      </div>
    </header>
  );
}

function TopicDetailsHeaderActions({ topic }: TopicDetailsHeaderProps) {
  return (
    <>
      <EventEntryDialog topicId={topic.id}>
        <Button iconLeft={<Plus aria-hidden="true" className="size-4" />}>
          Add event
        </Button>
      </EventEntryDialog>
      <TopicSettingsModal topic={topic} />
    </>
  );
}

export { TopicDetailsHeader };
