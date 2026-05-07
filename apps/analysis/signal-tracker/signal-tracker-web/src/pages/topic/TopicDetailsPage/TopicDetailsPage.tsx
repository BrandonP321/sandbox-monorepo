import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import {
  signalTrackerApiErrorCodes,
  type AssessmentUpdateReadModel,
  type Entry,
  type Topic
} from "@repo/signal-tracker-shared";

import { isApiErrorCode } from "@/api/apiError";
import { useGetTopicQuery } from "@/api";
import {
  AssessmentUpdateComposer,
  CurrentAssessmentPanel,
  EventEntryComposer,
  TopicTimeline,
  TopicSettingsModal
} from "@/components/signal-tracker";
import {
  Alert,
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  LoadingState
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

import { useTopicDetailsPageParams } from "./hooks/useTopicDetailsPageParams";

export function TopicDetailsPage() {
  const { topicId } = useTopicDetailsPageParams();
  const { data, error, errorMessage, isError, isLoading, refetch } =
    useGetTopicQuery({ topicId });
  const isTopicNotFound = isApiErrorCode(
    error,
    signalTrackerApiErrorCodes.topicNotFound
  );

  return (
    <main className="bg-background text-foreground min-h-screen supports-[height:100svh]:min-h-svh">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 supports-[height:100svh]:min-h-svh sm:px-6 lg:px-8">
        {isLoading ? <LoadingState label="Loading topic details" /> : null}

        {!isLoading && isError && isTopicNotFound ? (
          <TopicDetailsNotFoundState topicId={topicId} />
        ) : null}

        {!isLoading && isError && !isTopicNotFound ? (
          <TopicDetailsErrorState
            errorMessage={errorMessage}
            onRetry={refetch}
          />
        ) : null}

        {!isLoading && !isError && data ? (
          <TopicDetailsWorkspace
            currentAssessment={data.currentAssessment}
            topic={data.topic}
          />
        ) : null}
      </section>
    </main>
  );
}

function TopicDetailsWorkspace({
  currentAssessment,
  topic
}: {
  currentAssessment: AssessmentUpdateReadModel | null;
  topic: Topic;
}) {
  const [isAssessmentComposerOpen, setIsAssessmentComposerOpen] =
    useState(false);
  const [isEventComposerOpen, setIsEventComposerOpen] = useState(false);
  const [editingEventEntry, setEditingEventEntry] = useState<Entry | null>(
    null
  );

  function handleEventComposerOpenChange(open: boolean) {
    setIsEventComposerOpen(open);

    if (!open) {
      setEditingEventEntry(null);
    }
  }

  function openCreateEventComposer() {
    setEditingEventEntry(null);
    setIsEventComposerOpen(true);
  }

  function openEditEventComposer(entry: Entry) {
    setEditingEventEntry(entry);
    setIsEventComposerOpen(true);
  }

  return (
    <>
      <TopicDetailsHeader onAddEvent={openCreateEventComposer} topic={topic} />

      <div className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <aside className="lg:col-start-2 lg:row-start-1">
          <CurrentAssessmentPanel
            assessment={currentAssessment}
            onAssessmentAction={() => setIsAssessmentComposerOpen(true)}
          />
        </aside>
        <div className="lg:col-start-1 lg:row-start-1">
          <TopicTimeline
            onEditEventEntry={openEditEventComposer}
            topicId={topic.id}
          />
        </div>
      </div>
      {/* TODO: Can we refactor these composers so that we don't have to manage their open state? */}
      <AssessmentUpdateComposer
        hasCurrentAssessment={currentAssessment !== null}
        onOpenChange={setIsAssessmentComposerOpen}
        open={isAssessmentComposerOpen}
        topicId={topic.id}
      />
      <EventEntryComposer
        entry={editingEventEntry}
        onOpenChange={handleEventComposerOpenChange}
        open={isEventComposerOpen}
        topicId={topic.id}
      />
    </>
  );
}

function TopicDetailsHeader({
  onAddEvent,
  topic
}: {
  onAddEvent: () => void;
  topic: Topic;
}) {
  return (
    <header className="border-border border-b pb-5">
      <Link
        className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
        to={appRoutes.listTopics.path}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to topics
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Topic workspace
            </p>
            {topic.status === "archived" ? (
              <Badge variant="outline">Archived</Badge>
            ) : null}
          </div>
          <h1 className="mt-2 text-3xl font-semibold">{topic.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            {topic.framingQuestion}
          </p>
          {topic.scopeNote ? (
            <p className="border-border text-muted-foreground mt-3 max-w-3xl border-l pl-3 text-sm">
              {topic.scopeNote}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            iconLeft={<Plus aria-hidden="true" className="size-4" />}
            onClick={onAddEvent}
          >
            Add event
          </Button>
          <TopicSettingsModal topic={topic} />
        </div>
      </div>
    </header>
  );
}

function TopicDetailsErrorState({
  errorMessage,
  onRetry
}: {
  errorMessage: string | undefined;
  onRetry: () => void;
}) {
  return (
    <>
      <TopicDetailsFallbackHeader title="Topic Details" />
      <section className="py-5">
        <Alert
          actions={
            <Button onClick={onRetry} variant="outline">
              Retry
            </Button>
          }
          title="Topic could not be loaded."
          variant="danger"
        >
          {errorMessage ?? "Retry the request without leaving the page."}
        </Alert>
      </section>
    </>
  );
}

function TopicDetailsNotFoundState({ topicId }: { topicId: string }) {
  return (
    <>
      <TopicDetailsFallbackHeader title="Topic not found" />
      <section className="py-5">
        <EmptyState
          action={<BackToTopicsButton />}
          description={`No topic matched ${topicId}.`}
          title="Topic not found."
        />
      </section>
    </>
  );
}

function TopicDetailsFallbackHeader({ title }: { title: string }) {
  return (
    <header className="border-border border-b pb-5">
      <Link
        className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
        to={appRoutes.listTopics.path}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to topics
      </Link>
      <ContentHeader
        className="mt-4"
        eyebrow="Signal Tracker"
        headingLevel={1}
        title={title}
      />
    </header>
  );
}

function BackToTopicsButton() {
  return (
    <Link
      className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px]"
      to={appRoutes.listTopics.path}
    >
      Back to topics
    </Link>
  );
}
