import {
  createTopicRequestSchema,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type GetTopicResponse,
  type ListTopicsResponse,
  type ReviewCadence,
  type Topic
} from "@repo/signal-tracker-shared";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent
} from "react";

import { SignalTrackerApiError } from "./api/client";
import { createTopic, getTopic, listTopics } from "./api/topics";
import { DbWakeUpStatus } from "./dbWakeUp/DbWakeUpStatus";
import type { DbBackedRequestState } from "./dbWakeUp/useDbBackedRequest";
import { fetchHealthStatus } from "./health";

type HealthState =
  | { status: "loading" }
  | { status: "ready"; ok: boolean }
  | { status: "error" };

type AppRoute =
  | { name: "topicList" }
  | { name: "createTopic" }
  | { name: "topicDetail"; topicId: string }
  | { name: "notFound" };

type TopicFormValues = {
  title: string;
  framingQuestion: string;
  scopeNote: string;
  reviewCadence: ReviewCadence;
};

type TopicFieldErrors = Partial<Record<keyof TopicFormValues, string>>;

const defaultTopicFormValues: TopicFormValues = {
  title: "",
  framingQuestion: "",
  scopeNote: "",
  reviewCadence: "ad_hoc"
};

const reviewCadenceOptions = [
  { value: "ad_hoc", label: "Ad hoc" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" }
] satisfies Array<{ value: ReviewCadence; label: string }>;

const dossierSections = [
  {
    title: "Events",
    body: "Future dated events will preserve what happened over time."
  },
  {
    title: "Assessment updates",
    body: "Future assessment updates will preserve what you thought, why, and how your judgment changed."
  },
  {
    title: "Review notes",
    body: "Future review notes will record what you concluded when revisiting this dossier."
  },
  {
    title: "Evidence and citations",
    body: "Future evidence and citations will connect entries to reusable sources and precise anchors."
  },
  {
    title: "Review workflow",
    body: "Future review workflow will support since-last-review checks and review completion."
  },
  {
    title: "Export",
    body: "Future export will preserve the dossier and underlying data outside Signal Tracker."
  }
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC"
});

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseAppRoute(window.location.pathname)
  );
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading"
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseAppRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    void fetchHealthStatus()
      .then((result) => {
        if (isActive) {
          setHealthState({ status: "ready", ok: result.ok });
        }
      })
      .catch(() => {
        if (isActive) {
          setHealthState({ status: "error" });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const navigateTo = useCallback((nextRoute: AppRoute) => {
    const nextPath = getRoutePath(nextRoute);

    window.history.pushState({}, "", nextPath);
    setRoute(nextRoute);
  }, []);

  return (
    <main className="app-shell">
      <section className="product-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">R1 Manual Evidence-Backed Dossier</p>
            <h1 className="headline">Signal Tracker</h1>
          </div>
          <p className="lede">
            Keep a durable home for active topic dossiers before adding
            evidence-backed timeline work, assessment updates, and review notes.
          </p>
        </header>

        <BackendStatus healthState={healthState} />

        {route.name === "topicList" ? (
          <TopicListScreen
            onCreateTopic={() => navigateTo({ name: "createTopic" })}
            onOpenTopic={(topicId) =>
              navigateTo({ name: "topicDetail", topicId })
            }
          />
        ) : null}

        {route.name === "createTopic" ? (
          <TopicCreationScreen
            onTopicCreated={(topic) =>
              navigateTo({ name: "topicDetail", topicId: topic.id })
            }
            onNavigateTopics={() => navigateTo({ name: "topicList" })}
          />
        ) : null}

        {route.name === "topicDetail" ? (
          <TopicDetailScreen
            topicId={route.topicId}
            onNavigateTopics={() => navigateTo({ name: "topicList" })}
            onCreateTopic={() => navigateTo({ name: "createTopic" })}
          />
        ) : null}

        {route.name === "notFound" ? (
          <RouteNotFound
            onNavigateHome={() => navigateTo({ name: "topicList" })}
          />
        ) : null}
      </section>
    </main>
  );
}

function TopicListScreen({
  onCreateTopic,
  onOpenTopic
}: {
  onCreateTopic: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  const [topicListState, setTopicListState] = useState<
    DbBackedRequestState<ListTopicsResponse>
  >({ status: "loading" });
  const latestRunId = useRef(0);

  const loadTopics = useCallback(async () => {
    const runId = latestRunId.current + 1;
    latestRunId.current = runId;
    setTopicListState({ status: "loading" });

    try {
      const response = await listTopics(
        { query: undefined },
        {
          onProgress: (progress) => {
            if (latestRunId.current === runId) {
              setTopicListState({ status: progress.phase });
            }
          }
        }
      );

      if (latestRunId.current === runId) {
        setTopicListState({ status: "success", data: response });
      }
    } catch (error) {
      if (latestRunId.current === runId) {
        setTopicListState({ status: "error", error });
      }
    }
  }, []);

  useEffect(() => {
    void loadTopics();

    return () => {
      latestRunId.current += 1;
    };
  }, [loadTopics]);

  return (
    <section className="topic-list" aria-labelledby="topic-list-title">
      <header className="section-heading topic-list__header">
        <div>
          <p className="eyebrow">Topic home</p>
          <h2 id="topic-list-title">Active topic dossiers</h2>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={onCreateTopic}
        >
          New topic
        </button>
      </header>

      {topicListState.status === "loading" ? (
        <p className="status-text topic-list__status" role="status">
          Loading active topic dossiers...
        </p>
      ) : null}

      <DbWakeUpStatus
        state={topicListState}
        onRetry={() => void loadTopics()}
      />

      {topicListState.status === "success" &&
      topicListState.data.topics.length === 0 ? (
        <section
          className="topic-empty-state"
          aria-labelledby="topic-list-empty-title"
        >
          <p className="eyebrow">No active topics</p>
          <h3 id="topic-list-empty-title">Create your first topic dossier</h3>
          <p>
            Topics are evidence-backed dossiers organized around a framing
            question, review cadence, and clear scope.
          </p>
          <button
            className="primary-action"
            type="button"
            onClick={onCreateTopic}
          >
            Create a topic
          </button>
        </section>
      ) : null}

      {topicListState.status === "success" &&
      topicListState.data.topics.length > 0 ? (
        <div className="topic-list__grid" aria-label="Active topics">
          {topicListState.data.topics.map((topic) => (
            <TopicListCard
              key={topic.id}
              topic={topic}
              onOpenTopic={onOpenTopic}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TopicListCard({
  topic,
  onOpenTopic
}: {
  topic: Topic;
  onOpenTopic: (topicId: string) => void;
}) {
  const topicPath = getRoutePath({ name: "topicDetail", topicId: topic.id });

  function handleOpenTopic(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onOpenTopic(topic.id);
  }

  return (
    <article className="topic-list-card">
      <header>
        <p className="eyebrow">{formatTopicStatus(topic.status)}</p>
        <h3>
          <a href={topicPath} onClick={handleOpenTopic}>
            {topic.title}
          </a>
        </h3>
      </header>
      <p className="topic-list-card__framing-question">
        {topic.framingQuestion}
      </p>
      <dl className="topic-list-card__metadata" aria-label="Topic metadata">
        <MetadataItem
          label="Review cadence"
          value={formatReviewCadence(topic.reviewCadence)}
        />
        <MetadataItem
          label="Updated"
          value={formatTopicDate(topic.updatedAt)}
        />
      </dl>
    </article>
  );
}

function BackendStatus({ healthState }: { healthState: HealthState }) {
  return (
    <section className="status-panel" aria-labelledby="backend-status-title">
      <h2 id="backend-status-title">Backend connectivity</h2>
      {healthState.status === "loading" ? (
        <p className="status-text" role="status">
          Checking the API scaffold...
        </p>
      ) : null}
      {healthState.status === "ready" ? (
        <p className="status-text" role="status">
          API scaffold ready: {healthState.ok ? "healthy" : "unhealthy"}.
        </p>
      ) : null}
      {healthState.status === "error" ? (
        <p className="status-text status-text--error" role="alert">
          API scaffold unavailable.
        </p>
      ) : null}
    </section>
  );
}

function TopicCreationScreen({
  onTopicCreated,
  onNavigateTopics
}: {
  onTopicCreated: (topic: Topic) => void;
  onNavigateTopics: () => void;
}) {
  const [topicForm, setTopicForm] = useState<TopicFormValues>(
    defaultTopicFormValues
  );
  const [fieldErrors, setFieldErrors] = useState<TopicFieldErrors>({});
  const [topicCreationState, setTopicCreationState] = useState<
    DbBackedRequestState<CreateTopicResponse>
  >({ status: "idle" });
  const lastSubmittedRequest = useRef<CreateTopicRequest | null>(null);

  const isSubmitting =
    topicCreationState.status === "loading" ||
    topicCreationState.status === "waking";

  function updateField<FieldName extends keyof TopicFormValues>(
    fieldName: FieldName,
    value: TopicFormValues[FieldName]
  ) {
    setTopicForm((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined
    }));
  }

  async function handleTopicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedRequest = createTopicRequestSchema.safeParse(topicForm);

    if (!parsedRequest.success) {
      setFieldErrors(createFieldErrors(parsedRequest.error.issues));
      setTopicCreationState({ status: "idle" });
      return;
    }

    lastSubmittedRequest.current = parsedRequest.data;
    await submitTopic(parsedRequest.data);
  }

  async function retryTopicSubmit() {
    if (!lastSubmittedRequest.current) {
      return;
    }

    await submitTopic(lastSubmittedRequest.current);
  }

  async function submitTopic(request: CreateTopicRequest) {
    setFieldErrors({});
    setTopicCreationState({ status: "loading" });

    try {
      const response = await createTopic(request, {
        onProgress: (progress) => {
          setTopicCreationState({ status: progress.phase });
        }
      });

      setTopicCreationState({ status: "success", data: response });
      setTopicForm(defaultTopicFormValues);
      onTopicCreated(response.topic);
    } catch (error) {
      setTopicCreationState({ status: "error", error });
    }
  }

  return (
    <section className="topic-workspace">
      <form
        className="topic-form"
        aria-labelledby="topic-form-title"
        onSubmit={(event) => void handleTopicSubmit(event)}
      >
        <button
          className="text-action"
          type="button"
          onClick={onNavigateTopics}
        >
          View topics
        </button>

        <div className="section-heading">
          <p className="eyebrow">New topic</p>
          <h2 id="topic-form-title">Create a topic dossier</h2>
        </div>

        <label className="form-field" htmlFor="topic-title">
          <span>Title</span>
          <input
            id="topic-title"
            name="title"
            type="text"
            value={topicForm.title}
            aria-describedby={
              fieldErrors.title ? "topic-title-error" : undefined
            }
            aria-invalid={fieldErrors.title ? true : undefined}
            onChange={(event) => updateField("title", event.target.value)}
          />
          {fieldErrors.title ? (
            <span className="field-error" id="topic-title-error">
              {fieldErrors.title}
            </span>
          ) : null}
        </label>

        <label className="form-field" htmlFor="topic-framing-question">
          <span>Framing question</span>
          <textarea
            id="topic-framing-question"
            name="framingQuestion"
            rows={3}
            value={topicForm.framingQuestion}
            aria-describedby={
              fieldErrors.framingQuestion
                ? "topic-framing-question-error"
                : undefined
            }
            aria-invalid={fieldErrors.framingQuestion ? true : undefined}
            onChange={(event) =>
              updateField("framingQuestion", event.target.value)
            }
          />
          {fieldErrors.framingQuestion ? (
            <span className="field-error" id="topic-framing-question-error">
              {fieldErrors.framingQuestion}
            </span>
          ) : null}
        </label>

        <label className="form-field" htmlFor="topic-scope-note">
          <span>Scope note</span>
          <textarea
            id="topic-scope-note"
            name="scopeNote"
            rows={4}
            value={topicForm.scopeNote}
            onChange={(event) => updateField("scopeNote", event.target.value)}
          />
        </label>

        <label className="form-field" htmlFor="topic-review-cadence">
          <span>Review cadence</span>
          <select
            id="topic-review-cadence"
            name="reviewCadence"
            value={topicForm.reviewCadence}
            onChange={(event) =>
              updateField("reviewCadence", event.target.value as ReviewCadence)
            }
          >
            {reviewCadenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className="primary-action"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating topic..." : "Create topic"}
        </button>

        <DbWakeUpStatus
          state={topicCreationState}
          onRetry={() => void retryTopicSubmit()}
        />
      </form>

      <aside className="topic-summary topic-summary--empty">
        <p className="eyebrow">Topic home</p>
        <h2>No topic selected</h2>
        <p>
          Submit the form to create a durable dossier home for future events,
          assessments, review notes, evidence, citations, reviews, and export.
        </p>
      </aside>
    </section>
  );
}

function TopicDetailScreen({
  topicId,
  onNavigateTopics,
  onCreateTopic
}: {
  topicId: string;
  onNavigateTopics: () => void;
  onCreateTopic: () => void;
}) {
  const [topicState, setTopicState] = useState<
    DbBackedRequestState<GetTopicResponse>
  >({ status: "loading" });
  const latestRunId = useRef(0);

  const loadTopic = useCallback(async () => {
    const runId = latestRunId.current + 1;
    latestRunId.current = runId;
    setTopicState({ status: "loading" });

    try {
      const response = await getTopic(
        { topicId },
        {
          onProgress: (progress) => {
            if (latestRunId.current === runId) {
              setTopicState({ status: progress.phase });
            }
          }
        }
      );

      if (latestRunId.current === runId) {
        setTopicState({ status: "success", data: response });
      }
    } catch (error) {
      if (latestRunId.current === runId) {
        setTopicState({ status: "error", error });
      }
    }
  }, [topicId]);

  useEffect(() => {
    void loadTopic();

    return () => {
      latestRunId.current += 1;
    };
  }, [loadTopic]);

  const isNotFound =
    topicState.status === "error" && isTopicNotFoundError(topicState.error);

  return (
    <section className="topic-detail" aria-labelledby="topic-detail-title">
      <div className="topic-detail__actions">
        <button
          className="text-action"
          type="button"
          onClick={onNavigateTopics}
        >
          View topics
        </button>
        <button className="text-action" type="button" onClick={onCreateTopic}>
          New topic
        </button>
      </div>

      {topicState.status === "loading" ? (
        <p className="status-text topic-detail__status" role="status">
          Loading topic dossier...
        </p>
      ) : null}

      {isNotFound ? null : (
        <DbWakeUpStatus state={topicState} onRetry={() => void loadTopic()} />
      )}

      {isNotFound ? <TopicNotFound topicId={topicId} /> : null}

      {topicState.status === "success" ? (
        <TopicDossierShell topic={topicState.data.topic} />
      ) : null}
    </section>
  );
}

function TopicDossierShell({ topic }: { topic: Topic }) {
  return (
    <>
      <header className="topic-detail__header">
        <p className="eyebrow">Topic dossier</p>
        <h2 id="topic-detail-title">{topic.title}</h2>
        <p className="topic-detail__framing-question">
          {topic.framingQuestion}
        </p>
      </header>

      <dl className="topic-detail__metadata" aria-label="Topic metadata">
        <MetadataItem label="Status" value={formatTopicStatus(topic.status)} />
        <MetadataItem
          label="Review cadence"
          value={formatReviewCadence(topic.reviewCadence)}
        />
        <MetadataItem
          label="Created"
          value={formatTopicDate(topic.createdAt)}
        />
        <MetadataItem
          label="Updated"
          value={formatTopicDate(topic.updatedAt)}
        />
        {topic.scopeNote ? (
          <MetadataItem label="Scope note" value={topic.scopeNote} />
        ) : null}
      </dl>

      <section
        className="dossier-empty-sections"
        aria-label="Future R1 sections"
      >
        {dossierSections.map((section) => (
          <article className="dossier-empty-section" key={section.title}>
            <p className="eyebrow">Future R1 area</p>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
            <p className="dossier-empty-section__status">
              Shell only. Not functional yet.
            </p>
          </article>
        ))}
      </section>
    </>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function TopicNotFound({ topicId }: { topicId: string }) {
  return (
    <section className="topic-empty-state" aria-labelledby="topic-detail-title">
      <p className="eyebrow">Topic not found</p>
      <h2 id="topic-detail-title">No topic dossier found</h2>
      <p>
        Signal Tracker could not find a topic dossier for{" "}
        <strong>{topicId}</strong>.
      </p>
    </section>
  );
}

function RouteNotFound({ onNavigateHome }: { onNavigateHome: () => void }) {
  return (
    <section className="topic-empty-state" aria-labelledby="topic-detail-title">
      <p className="eyebrow">Unknown route</p>
      <h2 id="topic-detail-title">This Signal Tracker page does not exist</h2>
      <p>Open the topic list to choose or create a dossier.</p>
      <button className="primary-action" type="button" onClick={onNavigateHome}>
        View topics
      </button>
    </section>
  );
}

function createFieldErrors(
  issues: Array<{ path: PropertyKey[] }>
): TopicFieldErrors {
  const errors: TopicFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];

    if (fieldName === "title") {
      errors.title = "Enter a topic title.";
    }

    if (fieldName === "framingQuestion") {
      errors.framingQuestion = "Enter a framing question.";
    }

    if (fieldName === "reviewCadence") {
      errors.reviewCadence = "Choose a valid review cadence.";
    }
  }

  return errors;
}

function parseAppRoute(pathname: string): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") {
    return { name: "topicList" };
  }

  if (normalizedPath === "/topics/new") {
    return { name: "createTopic" };
  }

  const topicMatch = /^\/topics\/([^/]+)$/.exec(normalizedPath);

  if (topicMatch) {
    return { name: "topicDetail", topicId: decodeURIComponent(topicMatch[1]) };
  }

  return { name: "notFound" };
}

function getRoutePath(route: AppRoute): string {
  if (route.name === "topicDetail") {
    return `/topics/${encodeURIComponent(route.topicId)}`;
  }

  if (route.name === "createTopic") {
    return "/topics/new";
  }

  return "/";
}

function isTopicNotFoundError(error: unknown): boolean {
  return (
    error instanceof SignalTrackerApiError && error.code === "TOPIC_NOT_FOUND"
  );
}

function formatReviewCadence(reviewCadence: ReviewCadence): string {
  return (
    reviewCadenceOptions.find((option) => option.value === reviewCadence)
      ?.label ?? reviewCadence
  );
}

function formatTopicStatus(status: Topic["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatTopicDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
