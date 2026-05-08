import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import {
  signalTrackerApiErrorCodes,
  type AssessmentUpdateReadModel,
  type Topic
} from "@repo/signal-tracker-shared";

import { isApiErrorCode } from "@/api/apiError";
import { useGetTopicQuery } from "@/api";
import {
  CurrentAssessmentPanel,
  EventEntryDialog,
  TopicTimeline,
  TopicSettingsModal
} from "@/components/signal-tracker";
import {
  Alert,
  Badge,
  Button,
  ContentHeader,
  EmptyState,
  Inline,
  LoadingState,
  WithAside
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
    <section className="mx-auto flex w-full max-w-6xl flex-col">
      {isLoading ? <LoadingState label="Loading topic details" /> : null}

      {!isLoading && isError && isTopicNotFound ? (
        <TopicDetailsNotFoundState topicId={topicId} />
      ) : null}

      {!isLoading && isError && !isTopicNotFound ? (
        <TopicDetailsErrorState errorMessage={errorMessage} onRetry={refetch} />
      ) : null}

      {!isLoading && !isError && data ? (
        <TopicDetailsWorkspace
          currentAssessment={data.currentAssessment}
          topic={data.topic}
        />
      ) : null}
    </section>
  );
}

function TopicDetailsWorkspace({
  currentAssessment,
  topic
}: {
  currentAssessment: AssessmentUpdateReadModel | null;
  topic: Topic;
}) {
  return (
    <>
      <TopicDetailsHeader topic={topic} />

      <WithAside
        aside={
          <CurrentAssessmentPanel
            assessment={currentAssessment}
            topicId={topic.id}
          />
        }
        className="py-5"
        stickyAside
      >
        <TopicTimeline topicId={topic.id} />
      </WithAside>
    </>
  );
}

function TopicDetailsHeader({ topic }: { topic: Topic }) {
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
          <Inline align="center" gap="sm">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Topic workspace
            </p>
            {topic.status === "archived" ? (
              <Badge variant="outline">Archived</Badge>
            ) : null}
          </Inline>
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

        <Inline className="lg:justify-end" gap="sm">
          <EventEntryDialog topicId={topic.id}>
            <Button iconLeft={<Plus aria-hidden="true" className="size-4" />}>
              Add event
            </Button>
          </EventEntryDialog>
          <TopicSettingsModal topic={topic} />
        </Inline>
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
