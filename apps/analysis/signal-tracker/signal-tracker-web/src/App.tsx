import {
  createEventEntryRequestSchema,
  updateTopicRequestSchema,
  type ArchiveTopicResponse,
  type CreateEventEntryRequest,
  type CreateEventEntryResponse,
  createTopicRequestSchema,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type DeleteTopicResponse,
  type Entry,
  type EntryEpistemicStatus,
  type GetTopicResponse,
  type ListEventEntriesResponse,
  type ListTopicsResponse,
  type ReviewCadence,
  type Topic,
  type UpdateTopicRequest,
  type UpdateTopicResponse
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
import { createEventEntry, listEventEntries } from "./api/event-entries";
import {
  archiveTopic,
  createTopic,
  deleteTopic,
  getTopic,
  listTopics,
  updateTopic
} from "./api/topics";
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

type EventEntryFormValues = {
  title: string;
  bodyMd: string;
  sortDate: string;
  epistemicStatus: EntryEpistemicStatus;
};

type EventEntryFieldErrors = Partial<
  Record<keyof EventEntryFormValues, string>
>;

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

const epistemicStatusOptions = [
  { value: "reported", label: "Reported" },
  { value: "observed", label: "Observed" },
  { value: "inferred", label: "Inferred" },
  { value: "forecast", label: "Forecast" }
] satisfies Array<{ value: EntryEpistemicStatus; label: string }>;

const defaultEventEntryFormValues: EventEntryFormValues = {
  title: "",
  bodyMd: "",
  sortDate: "",
  epistemicStatus: "reported"
};

const dossierSections = [
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

  const removeArchivedTopic = useCallback((topicId: string) => {
    setTopicListState((currentState) => {
      if (currentState.status !== "success") {
        return currentState;
      }

      return {
        status: "success",
        data: {
          topics: currentState.data.topics.filter(
            (topic) => topic.id !== topicId
          )
        }
      };
    });
  }, []);

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
              onTopicArchived={removeArchivedTopic}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TopicListCard({
  topic,
  onOpenTopic,
  onTopicArchived
}: {
  topic: Topic;
  onOpenTopic: (topicId: string) => void;
  onTopicArchived: (topicId: string) => void;
}) {
  const topicPath = getRoutePath({ name: "topicDetail", topicId: topic.id });
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [archiveState, setArchiveState] = useState<
    DbBackedRequestState<ArchiveTopicResponse>
  >({ status: "idle" });

  const isArchiving =
    archiveState.status === "loading" || archiveState.status === "waking";

  function handleOpenTopic(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onOpenTopic(topic.id);
  }

  async function submitArchive() {
    setArchiveState({ status: "loading" });

    try {
      await archiveTopic(
        { topicId: topic.id },
        {
          onProgress: (progress) => {
            setArchiveState({ status: progress.phase });
          }
        }
      );

      setArchiveState({ status: "idle" });
      setIsConfirmingArchive(false);
      onTopicArchived(topic.id);
    } catch (error) {
      setArchiveState({ status: "error", error });
    }
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
      <div className="topic-list-card__actions">
        {isConfirmingArchive ? (
          <div className="inline-confirmation">
            <p>
              Archive hides this topic from active lists while preserving the
              dossier record.
            </p>
            <button
              className="secondary-action"
              type="button"
              disabled={isArchiving}
              onClick={() => void submitArchive()}
            >
              {isArchiving ? "Archiving..." : "Confirm archive"}
            </button>
            <button
              className="text-action"
              type="button"
              disabled={isArchiving}
              onClick={() => setIsConfirmingArchive(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="text-action"
            type="button"
            onClick={() => setIsConfirmingArchive(true)}
          >
            Archive
          </button>
        )}
      </div>
      <DbWakeUpStatus
        state={archiveState}
        onRetry={() => void submitArchive()}
      />
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

        <TopicMetadataFields
          idPrefix="topic"
          values={topicForm}
          fieldErrors={fieldErrors}
          onUpdateField={updateField}
        />

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

function TopicMetadataFields({
  idPrefix,
  values,
  fieldErrors,
  onUpdateField
}: {
  idPrefix: string;
  values: TopicFormValues;
  fieldErrors: TopicFieldErrors;
  onUpdateField: <FieldName extends keyof TopicFormValues>(
    fieldName: FieldName,
    value: TopicFormValues[FieldName]
  ) => void;
}) {
  const titleId = `${idPrefix}-title`;
  const titleErrorId = `${titleId}-error`;
  const framingQuestionId = `${idPrefix}-framing-question`;
  const framingQuestionErrorId = `${framingQuestionId}-error`;
  const scopeNoteId = `${idPrefix}-scope-note`;
  const reviewCadenceId = `${idPrefix}-review-cadence`;

  return (
    <>
      <label className="form-field" htmlFor={titleId}>
        <span>Title</span>
        <input
          id={titleId}
          name="title"
          type="text"
          value={values.title}
          aria-describedby={fieldErrors.title ? titleErrorId : undefined}
          aria-invalid={fieldErrors.title ? true : undefined}
          onChange={(event) => onUpdateField("title", event.target.value)}
        />
        {fieldErrors.title ? (
          <span className="field-error" id={titleErrorId}>
            {fieldErrors.title}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor={framingQuestionId}>
        <span>Framing question</span>
        <textarea
          id={framingQuestionId}
          name="framingQuestion"
          rows={3}
          value={values.framingQuestion}
          aria-describedby={
            fieldErrors.framingQuestion ? framingQuestionErrorId : undefined
          }
          aria-invalid={fieldErrors.framingQuestion ? true : undefined}
          onChange={(event) =>
            onUpdateField("framingQuestion", event.target.value)
          }
        />
        {fieldErrors.framingQuestion ? (
          <span className="field-error" id={framingQuestionErrorId}>
            {fieldErrors.framingQuestion}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor={scopeNoteId}>
        <span>Scope note</span>
        <textarea
          id={scopeNoteId}
          name="scopeNote"
          rows={4}
          value={values.scopeNote}
          onChange={(event) => onUpdateField("scopeNote", event.target.value)}
        />
      </label>

      <label className="form-field" htmlFor={reviewCadenceId}>
        <span>Review cadence</span>
        <select
          id={reviewCadenceId}
          name="reviewCadence"
          value={values.reviewCadence}
          onChange={(event) =>
            onUpdateField("reviewCadence", event.target.value as ReviewCadence)
          }
        >
          {reviewCadenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
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

  const updateLoadedTopic = useCallback((topic: Topic) => {
    setTopicState({ status: "success", data: { topic } });
  }, []);

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
        <TopicDossierShell
          topic={topicState.data.topic}
          onTopicChanged={updateLoadedTopic}
          onTopicDeleted={onNavigateTopics}
        />
      ) : null}
    </section>
  );
}

function TopicDossierShell({
  topic,
  onTopicChanged,
  onTopicDeleted
}: {
  topic: Topic;
  onTopicChanged: (topic: Topic) => void;
  onTopicDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [topicForm, setTopicForm] = useState<TopicFormValues>(() =>
    topicToFormValues(topic)
  );
  const [fieldErrors, setFieldErrors] = useState<TopicFieldErrors>({});
  const [updateState, setUpdateState] = useState<
    DbBackedRequestState<UpdateTopicResponse>
  >({ status: "idle" });
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [archiveState, setArchiveState] = useState<
    DbBackedRequestState<ArchiveTopicResponse>
  >({ status: "idle" });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmationTitle, setDeleteConfirmationTitle] = useState("");
  const [deleteState, setDeleteState] = useState<
    DbBackedRequestState<DeleteTopicResponse>
  >({ status: "idle" });
  const lastSubmittedUpdate = useRef<UpdateTopicRequest | null>(null);
  const [eventListState, setEventListState] = useState<
    DbBackedRequestState<ListEventEntriesResponse>
  >({ status: "loading" });
  const eventListRunId = useRef(0);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventForm, setEventForm] = useState<EventEntryFormValues>(
    defaultEventEntryFormValues
  );
  const [eventFieldErrors, setEventFieldErrors] =
    useState<EventEntryFieldErrors>({});
  const [createEventState, setCreateEventState] = useState<
    DbBackedRequestState<CreateEventEntryResponse>
  >({ status: "idle" });
  const lastSubmittedEvent = useRef<CreateEventEntryRequest | null>(null);

  const isUpdating =
    updateState.status === "loading" || updateState.status === "waking";
  const isArchiving =
    archiveState.status === "loading" || archiveState.status === "waking";
  const isDeleting =
    deleteState.status === "loading" || deleteState.status === "waking";
  const isCreatingEvent =
    createEventState.status === "loading" ||
    createEventState.status === "waking";
  const canDelete = deleteConfirmationTitle === topic.title && !isDeleting;

  const loadEventEntries = useCallback(async () => {
    const runId = eventListRunId.current + 1;
    eventListRunId.current = runId;
    setEventListState({ status: "loading" });

    try {
      const response = await listEventEntries(
        { topicId: topic.id },
        {
          onProgress: (progress) => {
            if (eventListRunId.current === runId) {
              setEventListState({ status: progress.phase });
            }
          }
        }
      );

      if (eventListRunId.current === runId) {
        setEventListState({
          status: "success",
          data: {
            entries: sortEventEntries(response.entries)
          }
        });
      }
    } catch (error) {
      if (eventListRunId.current === runId) {
        setEventListState({ status: "error", error });
      }
    }
  }, [topic.id]);

  useEffect(() => {
    if (!isEditing) {
      setTopicForm(topicToFormValues(topic));
    }
  }, [isEditing, topic]);

  useEffect(() => {
    void loadEventEntries();

    return () => {
      eventListRunId.current += 1;
    };
  }, [loadEventEntries]);

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

  function updateEventField<FieldName extends keyof EventEntryFormValues>(
    fieldName: FieldName,
    value: EventEntryFormValues[FieldName]
  ) {
    setEventForm((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
    setEventFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined
    }));
  }

  function openEventForm() {
    setIsEventFormOpen(true);
    setCreateEventState({ status: "idle" });
    setEventFieldErrors({});
  }

  function cancelEventForm() {
    setIsEventFormOpen(false);
    setEventForm(defaultEventEntryFormValues);
    setEventFieldErrors({});
    setCreateEventState({ status: "idle" });
    lastSubmittedEvent.current = null;
  }

  function startEditing() {
    setTopicForm(topicToFormValues(topic));
    setFieldErrors({});
    setUpdateState({ status: "idle" });
    setIsEditing(true);
  }

  function cancelEditing() {
    setTopicForm(topicToFormValues(topic));
    setFieldErrors({});
    setUpdateState({ status: "idle" });
    setIsEditing(false);
  }

  async function handleTopicUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedRequest = updateTopicRequestSchema.safeParse({
      topicId: topic.id,
      ...topicForm
    });

    if (!parsedRequest.success) {
      setFieldErrors(createFieldErrors(parsedRequest.error.issues));
      setUpdateState({ status: "idle" });
      return;
    }

    lastSubmittedUpdate.current = parsedRequest.data;
    await submitTopicUpdate(parsedRequest.data);
  }

  async function retryTopicUpdate() {
    if (!lastSubmittedUpdate.current) {
      return;
    }

    await submitTopicUpdate(lastSubmittedUpdate.current);
  }

  async function submitTopicUpdate(request: UpdateTopicRequest) {
    setFieldErrors({});
    setUpdateState({ status: "loading" });

    try {
      const response = await updateTopic(request, {
        onProgress: (progress) => {
          setUpdateState({ status: progress.phase });
        }
      });

      setUpdateState({ status: "success", data: response });
      onTopicChanged(response.topic);
      setIsEditing(false);
    } catch (error) {
      setUpdateState({ status: "error", error });
    }
  }

  async function submitArchive() {
    setArchiveState({ status: "loading" });

    try {
      const response = await archiveTopic(
        { topicId: topic.id },
        {
          onProgress: (progress) => {
            setArchiveState({ status: progress.phase });
          }
        }
      );

      setArchiveState({ status: "success", data: response });
      setIsConfirmingArchive(false);
      onTopicChanged(response.topic);
    } catch (error) {
      setArchiveState({ status: "error", error });
    }
  }

  async function submitDelete() {
    if (deleteConfirmationTitle !== topic.title) {
      return;
    }

    setDeleteState({ status: "loading" });

    try {
      const response = await deleteTopic(
        { topicId: topic.id },
        {
          onProgress: (progress) => {
            setDeleteState({ status: progress.phase });
          }
        }
      );

      setDeleteState({ status: "success", data: response });
      onTopicDeleted();
    } catch (error) {
      setDeleteState({ status: "error", error });
    }
  }

  async function handleCreateEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedRequest = createEventEntryRequestSchema.safeParse({
      topicId: topic.id,
      title: eventForm.title,
      bodyMd: eventForm.bodyMd,
      sortAt: toEventSortAt(eventForm.sortDate),
      epistemicStatus: eventForm.epistemicStatus
    });

    if (!parsedRequest.success) {
      setEventFieldErrors(createEventFieldErrors(parsedRequest.error.issues));
      setCreateEventState({ status: "idle" });
      return;
    }

    lastSubmittedEvent.current = parsedRequest.data;
    await submitEventEntry(parsedRequest.data);
  }

  async function retryCreateEvent() {
    if (!lastSubmittedEvent.current) {
      return;
    }

    await submitEventEntry(lastSubmittedEvent.current);
  }

  async function submitEventEntry(request: CreateEventEntryRequest) {
    setEventFieldErrors({});
    setCreateEventState({ status: "loading" });

    try {
      const response = await createEventEntry(request, {
        onProgress: (progress) => {
          setCreateEventState({ status: progress.phase });
        }
      });

      setCreateEventState({ status: "success", data: response });
      setEventForm(defaultEventEntryFormValues);
      setEventListState((currentState) => {
        if (currentState.status !== "success") {
          return {
            status: "success",
            data: { entries: [response.entry] }
          };
        }

        return {
          status: "success",
          data: {
            entries: sortEventEntries([
              response.entry,
              ...currentState.data.entries.filter(
                (entry) => entry.id !== response.entry.id
              )
            ])
          }
        };
      });
    } catch (error) {
      setCreateEventState({ status: "error", error });
    }
  }

  if (isEditing) {
    return (
      <form
        className="topic-form topic-edit-form"
        aria-labelledby="topic-detail-title"
        onSubmit={(event) => void handleTopicUpdateSubmit(event)}
      >
        <div className="section-heading topic-edit-form__header">
          <div>
            <p className="eyebrow">Edit topic</p>
            <h2 id="topic-detail-title">Edit topic metadata</h2>
          </div>
          <button
            className="text-action"
            type="button"
            disabled={isUpdating}
            onClick={cancelEditing}
          >
            Cancel
          </button>
        </div>

        <TopicMetadataFields
          idPrefix="topic-edit"
          values={topicForm}
          fieldErrors={fieldErrors}
          onUpdateField={updateField}
        />

        <button className="primary-action" type="submit" disabled={isUpdating}>
          {isUpdating ? "Saving topic..." : "Save changes"}
        </button>

        <DbWakeUpStatus
          state={updateState}
          onRetry={() => void retryTopicUpdate()}
        />
      </form>
    );
  }

  return (
    <>
      <header className="topic-detail__header">
        <div>
          <p className="eyebrow">Topic dossier</p>
          <h2 id="topic-detail-title">{topic.title}</h2>
        </div>
        <button
          className="secondary-action"
          type="button"
          onClick={startEditing}
        >
          Edit topic
        </button>
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

      <EventEntriesSection
        entries={
          eventListState.status === "success" ? eventListState.data.entries : []
        }
        eventListState={eventListState}
        isEventFormOpen={isEventFormOpen}
        formValues={eventForm}
        fieldErrors={eventFieldErrors}
        createState={createEventState}
        isCreating={isCreatingEvent}
        onOpenForm={openEventForm}
        onCancelForm={cancelEventForm}
        onUpdateField={updateEventField}
        onSubmit={(event) => void handleCreateEventSubmit(event)}
        onRetryList={() => void loadEventEntries()}
        onRetryCreate={() => void retryCreateEvent()}
      />

      <section
        className="topic-lifecycle-panel"
        aria-labelledby="topic-lifecycle-title"
      >
        <div>
          <p className="eyebrow">Lifecycle</p>
          <h3 id="topic-lifecycle-title">Manage topic visibility</h3>
          <p>
            Archive hides this topic from active lists while preserving the
            dossier record.
          </p>
        </div>
        {topic.status === "archived" ? (
          <p className="status-text">This topic is archived.</p>
        ) : isConfirmingArchive ? (
          <div className="inline-confirmation">
            <p>
              Confirm archive to remove this topic from active lists. The topic
              remains directly readable by URL.
            </p>
            <button
              className="secondary-action"
              type="button"
              disabled={isArchiving}
              onClick={() => void submitArchive()}
            >
              {isArchiving ? "Archiving..." : "Confirm archive"}
            </button>
            <button
              className="text-action"
              type="button"
              disabled={isArchiving}
              onClick={() => setIsConfirmingArchive(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="secondary-action"
            type="button"
            onClick={() => setIsConfirmingArchive(true)}
          >
            Archive topic
          </button>
        )}
        <DbWakeUpStatus
          state={archiveState}
          onRetry={() => void submitArchive()}
        />
      </section>

      <section className="danger-zone" aria-labelledby="topic-delete-title">
        <p className="eyebrow">Danger zone</p>
        <h3 id="topic-delete-title">Permanently delete topic row</h3>
        <p>
          The current API permanently removes the topic row. Use archive when
          you only need to clean up active lists.
        </p>
        {isConfirmingDelete ? (
          <div className="delete-confirmation">
            <label className="form-field" htmlFor="topic-delete-confirmation">
              <span>Type {topic.title} to confirm</span>
              <input
                id="topic-delete-confirmation"
                type="text"
                value={deleteConfirmationTitle}
                onChange={(event) =>
                  setDeleteConfirmationTitle(event.target.value)
                }
              />
            </label>
            <button
              className="danger-action"
              type="button"
              disabled={!canDelete}
              onClick={() => void submitDelete()}
            >
              {isDeleting ? "Deleting topic..." : "Permanently delete topic"}
            </button>
            <button
              className="text-action"
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setIsConfirmingDelete(false);
                setDeleteConfirmationTitle("");
                setDeleteState({ status: "idle" });
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="danger-link-action"
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
          >
            Delete topic
          </button>
        )}
        <DbWakeUpStatus
          state={deleteState}
          onRetry={() => void submitDelete()}
        />
      </section>

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

function EventEntriesSection({
  entries,
  eventListState,
  isEventFormOpen,
  formValues,
  fieldErrors,
  createState,
  isCreating,
  onOpenForm,
  onCancelForm,
  onUpdateField,
  onSubmit,
  onRetryList,
  onRetryCreate
}: {
  entries: Entry[];
  eventListState: DbBackedRequestState<ListEventEntriesResponse>;
  isEventFormOpen: boolean;
  formValues: EventEntryFormValues;
  fieldErrors: EventEntryFieldErrors;
  createState: DbBackedRequestState<CreateEventEntryResponse>;
  isCreating: boolean;
  onOpenForm: () => void;
  onCancelForm: () => void;
  onUpdateField: <FieldName extends keyof EventEntryFormValues>(
    fieldName: FieldName,
    value: EventEntryFormValues[FieldName]
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRetryList: () => void;
  onRetryCreate: () => void;
}) {
  return (
    <section className="event-entries" aria-labelledby="event-entries-title">
      <div className="event-entries__header">
        <div>
          <p className="eyebrow">Events</p>
          <h3 id="event-entries-title">Topic events</h3>
          <p>
            Event entries record what happened, was reported, or was observed.
            Assessment updates and review notes stay separate.
          </p>
        </div>
        {isEventFormOpen ? null : (
          <button
            className="secondary-action"
            type="button"
            onClick={onOpenForm}
          >
            Add event
          </button>
        )}
      </div>

      {isEventFormOpen ? (
        <form
          className="event-entry-form"
          aria-label="Add event entry"
          onSubmit={onSubmit}
        >
          <div className="event-entry-form__header">
            <h4>Add event entry</h4>
            <button
              className="text-action"
              type="button"
              disabled={isCreating}
              onClick={onCancelForm}
            >
              Cancel
            </button>
          </div>
          <EventEntryFields
            values={formValues}
            fieldErrors={fieldErrors}
            onUpdateField={onUpdateField}
          />
          <button
            className="primary-action"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Saving event..." : "Save event"}
          </button>
          {createState.status === "success" ? (
            <p className="status-text event-entry-form__success" role="status">
              Event saved.
            </p>
          ) : null}
          <DbWakeUpStatus state={createState} onRetry={onRetryCreate} />
        </form>
      ) : null}

      {eventListState.status === "loading" ? (
        <p className="status-text event-entries__status" role="status">
          Loading event entries...
        </p>
      ) : null}
      <DbWakeUpStatus state={eventListState} onRetry={onRetryList} />

      {eventListState.status === "success" && entries.length === 0 ? (
        <p className="event-entries__empty">
          No events yet. Add dated developments here when something happens, is
          reported, or is observed.
        </p>
      ) : null}

      {entries.length > 0 ? (
        <div className="event-entry-list" aria-label="Event entries">
          {entries.map((entry) => (
            <article className="event-entry-card" key={entry.id}>
              <div className="event-entry-card__metadata">
                <time dateTime={entry.sortAt}>
                  {formatTopicDate(entry.sortAt)}
                </time>
                <span>{formatEpistemicStatus(entry.epistemicStatus)}</span>
                <span>Uncited</span>
              </div>
              <h4>{entry.title}</h4>
              <p>{entry.bodyMd}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function EventEntryFields({
  values,
  fieldErrors,
  onUpdateField
}: {
  values: EventEntryFormValues;
  fieldErrors: EventEntryFieldErrors;
  onUpdateField: <FieldName extends keyof EventEntryFormValues>(
    fieldName: FieldName,
    value: EventEntryFormValues[FieldName]
  ) => void;
}) {
  const titleErrorId = "event-title-error";
  const bodyErrorId = "event-body-error";
  const dateErrorId = "event-date-error";
  const epistemicStatusErrorId = "event-epistemic-status-error";

  return (
    <>
      <label className="form-field" htmlFor="event-title">
        <span>Event title</span>
        <input
          id="event-title"
          type="text"
          value={values.title}
          aria-invalid={fieldErrors.title ? "true" : undefined}
          aria-describedby={fieldErrors.title ? titleErrorId : undefined}
          onChange={(event) => onUpdateField("title", event.target.value)}
        />
        {fieldErrors.title ? (
          <span className="field-error" id={titleErrorId}>
            {fieldErrors.title}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="event-body">
        <span>Event description</span>
        <textarea
          id="event-body"
          rows={4}
          value={values.bodyMd}
          aria-invalid={fieldErrors.bodyMd ? "true" : undefined}
          aria-describedby={fieldErrors.bodyMd ? bodyErrorId : undefined}
          onChange={(event) => onUpdateField("bodyMd", event.target.value)}
        />
        {fieldErrors.bodyMd ? (
          <span className="field-error" id={bodyErrorId}>
            {fieldErrors.bodyMd}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="event-date">
        <span>Event date</span>
        <input
          id="event-date"
          type="date"
          value={values.sortDate}
          aria-invalid={fieldErrors.sortDate ? "true" : undefined}
          aria-describedby={fieldErrors.sortDate ? dateErrorId : undefined}
          onChange={(event) => onUpdateField("sortDate", event.target.value)}
        />
        {fieldErrors.sortDate ? (
          <span className="field-error" id={dateErrorId}>
            {fieldErrors.sortDate}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="event-epistemic-status">
        <span>Epistemic label</span>
        <select
          id="event-epistemic-status"
          value={values.epistemicStatus}
          aria-invalid={fieldErrors.epistemicStatus ? "true" : undefined}
          aria-describedby={
            fieldErrors.epistemicStatus ? epistemicStatusErrorId : undefined
          }
          onChange={(event) =>
            onUpdateField(
              "epistemicStatus",
              event.target.value as EntryEpistemicStatus
            )
          }
        >
          {epistemicStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.epistemicStatus ? (
          <span className="field-error" id={epistemicStatusErrorId}>
            {fieldErrors.epistemicStatus}
          </span>
        ) : null}
      </label>
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

function createEventFieldErrors(
  issues: Array<{ path: PropertyKey[] }>
): EventEntryFieldErrors {
  const errors: EventEntryFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];

    if (fieldName === "title") {
      errors.title = "Enter an event title.";
    }

    if (fieldName === "bodyMd") {
      errors.bodyMd = "Enter an event description.";
    }

    if (fieldName === "sortAt") {
      errors.sortDate = "Choose an event date.";
    }

    if (fieldName === "epistemicStatus") {
      errors.epistemicStatus = "Choose a valid epistemic label.";
    }
  }

  return errors;
}

function topicToFormValues(topic: Topic): TopicFormValues {
  return {
    title: topic.title,
    framingQuestion: topic.framingQuestion,
    scopeNote: topic.scopeNote ?? "",
    reviewCadence: topic.reviewCadence
  };
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

function formatEpistemicStatus(status: EntryEpistemicStatus): string {
  return (
    epistemicStatusOptions.find((option) => option.value === status)?.label ??
    status
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

function toEventSortAt(sortDate: string): string {
  if (!sortDate) {
    return "";
  }

  return `${sortDate}T00:00:00.000Z`;
}

function sortEventEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((left, right) => {
    const sortAtComparison = right.sortAt.localeCompare(left.sortAt);

    if (sortAtComparison !== 0) {
      return sortAtComparison;
    }

    const createdAtComparison = right.createdAt.localeCompare(left.createdAt);

    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }

    return left.id.localeCompare(right.id);
  });
}
