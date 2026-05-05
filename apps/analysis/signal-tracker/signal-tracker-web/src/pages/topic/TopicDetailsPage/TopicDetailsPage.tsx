import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import {
  signalTrackerApiErrorCodes,
  type Topic
} from "@repo/signal-tracker-shared";

import { isApiErrorCode } from "@/api/apiError";
import { useGetTopicQuery } from "@/api";
import { TopicSettingsModal } from "@/components/signal-tracker";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState
} from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

import { useTopicDetailsPageParams } from "./hooks/useTopicDetailsPageParams";

// TODO: Create reusable UI components for this page

export function TopicDetailsPage() {
  const { topicId } = useTopicDetailsPageParams();
  const { data, error, errorMessage, isError, isLoading, refetch } =
    useGetTopicQuery({ topicId });
  const isTopicNotFound = isApiErrorCode(
    error,
    signalTrackerApiErrorCodes.topicNotFound
  );

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
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
          <TopicDetailsWorkspace topic={data.topic} />
        ) : null}
      </section>
    </main>
  );
}

function TopicDetailsWorkspace({ topic }: { topic: Topic }) {
  return (
    <>
      <TopicDetailsHeader topic={topic} />

      <div className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <TimelinePlaceholder />
        <CurrentAssessmentPlaceholder />
      </div>
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
          <Button disabled>
            <Plus aria-hidden="true" className="size-4" />
            Add entry
          </Button>
          <TopicSettingsModal topic={topic} />
        </div>
      </div>
    </header>
  );
}

function TimelinePlaceholder() {
  return (
    <section aria-labelledby="topic-timeline-heading">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="topic-timeline-heading" className="text-xl font-semibold">
                Timeline
              </h2>
              <p className="text-muted-foreground text-sm">
                Compact topic history and entry expansion surface.
              </p>
            </div>
            <Badge variant="secondary">Reserved region</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="Events and assessment updates will compose here in chronological context."
            title="No timeline entries loaded in this shell."
          />
        </CardContent>
      </Card>
    </section>
  );
}

function CurrentAssessmentPlaceholder() {
  return (
    <aside aria-labelledby="current-assessment-heading">
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2
              id="current-assessment-heading"
              className="text-lg font-semibold"
            >
              Current assessment
            </h2>
            <p className="text-muted-foreground text-sm">
              Compact judgment panel and mobile banner surface.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            description="The latest assessment treatment will appear in this region."
            title="No current assessment displayed in this shell."
          />
        </CardContent>
      </Card>
    </aside>
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
      <p className="text-muted-foreground mt-4 text-xs font-medium uppercase">
        Signal Tracker
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
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
