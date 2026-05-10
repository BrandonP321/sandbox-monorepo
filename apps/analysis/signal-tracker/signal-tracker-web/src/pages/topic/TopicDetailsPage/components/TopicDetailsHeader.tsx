import { Plus } from "lucide-react";
import type { Topic } from "@repo/signal-tracker-shared";

import {
  EventEntryDialog,
  TopicSettingsModal
} from "@/components/signal-tracker";
import { Badge, Button, ContentHeader } from "@/components/ui";

type TopicDetailsHeaderProps = {
  topic: Topic;
};

function TopicDetailsHeader({ topic }: TopicDetailsHeaderProps) {
  return (
    <header className="border-border border-b pb-5">
      <div>
        <ContentHeader
          actions={<TopicDetailsHeaderActions topic={topic} />}
          description={topic.framingQuestion}
          headingLevel={1}
          renderDescription={({ children, className }) => (
            <p className={`${className} max-w-3xl`}>{children}</p>
          )}
          renderHeading={({ children, className }) => (
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={className}>{children}</h1>
              {topic.status === "archived" ? (
                <Badge variant="outline">Archived</Badge>
              ) : null}
            </div>
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
