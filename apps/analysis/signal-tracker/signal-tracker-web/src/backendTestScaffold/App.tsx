import {
  assessmentConfidenceLabelSchema,
  captureEvidenceUrlRequestSchema,
  createAssessmentUpdateRequestSchema,
  createEventEntryRequestSchema,
  createReviewNoteRequestSchema,
  updateTopicRequestSchema,
  type AssessmentConfidenceLabel,
  type AssessmentUpdate,
  type ArchiveTopicResponse,
  type AttachEntryCitationResponse,
  type CaptureEvidenceUrlRequest,
  type CaptureEvidenceUrlResponse,
  type CreateAssessmentUpdateRequest,
  type CreateAssessmentUpdateResponse,
  type CreateEventEntryRequest,
  type CreateEventEntryResponse,
  type CreateReviewNoteRequest,
  type CreateReviewNoteResponse,
  createTopicRequestSchema,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type DeleteTopicResponse,
  type DetachEntryCitationResponse,
  type Entry,
  type EntryCitationRecord,
  type EntryEpistemicStatus,
  type EvidenceAnchor,
  type EvidenceRecord,
  type GetTopicResponse,
  type ListEventEntriesResponse,
  type ListEntryCitationsResponse,
  type ListEvidenceAnchorsForItemResponse,
  type ListEvidenceItemsResponse,
  type ListReviewNotesResponse,
  type ListTopicTimelineResponse,
  type ListTopicsResponse,
  type ReviewCadence,
  type Topic,
  type TopicTimelineItem,
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
import { createAssessmentUpdate } from "./api/assessments";
import {
  captureEvidenceUrl,
  listEvidenceAnchorsForItem,
  listEvidenceItems
} from "./api/evidence";
import {
  attachEntryCitation,
  detachEntryCitation,
  listEntryCitations
} from "./api/citations";
import { createEventEntry, listEventEntries } from "./api/event-entries";
import { createReviewNote, listReviewNotes } from "./api/review-notes";
import { listTopicTimeline } from "./api/timeline";
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

type ReviewNoteFormValues = {
  title: string;
  bodyMd: string;
  sortDate: string;
  epistemicStatus: EntryEpistemicStatus;
};

type ReviewNoteFieldErrors = Partial<
  Record<keyof ReviewNoteFormValues, string>
>;

type AssessmentFormValues = {
  judgment: string;
  confidenceLabel: AssessmentConfidenceLabel | "";
  assessmentDate: string;
  assumptions: string;
  indicators: string;
  probabilityPct: string;
  resolutionCriteria: string;
  targetResolutionDate: string;
};

type AssessmentFieldErrors = Partial<
  Record<keyof AssessmentFormValues, string>
>;

type CitationFormValues = {
  evidenceItemId: string;
  evidenceAnchorId: string;
  note: string;
};

type TopicTimelineMode = "recent" | "full";

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

const defaultReviewNoteFormValues: ReviewNoteFormValues = {
  title: "",
  bodyMd: "",
  sortDate: "",
  epistemicStatus: "inferred"
};

const defaultAssessmentFormValues: AssessmentFormValues = {
  judgment: "",
  confidenceLabel: "",
  assessmentDate: "",
  assumptions: "",
  indicators: "",
  probabilityPct: "",
  resolutionCriteria: "",
  targetResolutionDate: ""
};

const defaultCitationFormValues: CitationFormValues = {
  evidenceItemId: "",
  evidenceAnchorId: "",
  note: ""
};

const assessmentConfidenceOptions = assessmentConfidenceLabelSchema.options.map(
  (value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  })
) satisfies Array<{ value: AssessmentConfidenceLabel; label: string }>;

const dossierSections = [
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

const RECENT_TIMELINE_VISIBLE_COUNT = 5;
const RECENT_TIMELINE_REQUEST_LIMIT = RECENT_TIMELINE_VISIBLE_COUNT + 1;

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
    <section className="topic-list">
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
        <section className="topic-empty-state">
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
    <section className="status-panel">
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
    setTopicState((currentState) => ({
      status: "success",
      data: {
        topic,
        currentAssessment:
          currentState.status === "success"
            ? currentState.data.currentAssessment
            : null
      }
    }));
  }, []);

  const isNotFound =
    topicState.status === "error" && isTopicNotFoundError(topicState.error);

  return (
    <section className="topic-detail">
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
          initialCurrentAssessment={topicState.data.currentAssessment}
          onTopicChanged={updateLoadedTopic}
          onTopicDeleted={onNavigateTopics}
        />
      ) : null}
    </section>
  );
}

function TopicDossierShell({
  topic,
  initialCurrentAssessment,
  onTopicChanged,
  onTopicDeleted
}: {
  topic: Topic;
  initialCurrentAssessment: AssessmentUpdate | null;
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
  const [reviewNoteListState, setReviewNoteListState] = useState<
    DbBackedRequestState<ListReviewNotesResponse>
  >({ status: "loading" });
  const reviewNoteListRunId = useRef(0);
  const [isReviewNoteFormOpen, setIsReviewNoteFormOpen] = useState(false);
  const [reviewNoteForm, setReviewNoteForm] = useState<ReviewNoteFormValues>(
    defaultReviewNoteFormValues
  );
  const [reviewNoteFieldErrors, setReviewNoteFieldErrors] =
    useState<ReviewNoteFieldErrors>({});
  const [createReviewNoteState, setCreateReviewNoteState] = useState<
    DbBackedRequestState<CreateReviewNoteResponse>
  >({ status: "idle" });
  const lastSubmittedReviewNote = useRef<CreateReviewNoteRequest | null>(null);
  const [currentAssessment, setCurrentAssessment] =
    useState<AssessmentUpdate | null>(initialCurrentAssessment);
  const [isAssessmentFormOpen, setIsAssessmentFormOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentFormValues>(
    defaultAssessmentFormValues
  );
  const [assessmentFieldErrors, setAssessmentFieldErrors] =
    useState<AssessmentFieldErrors>({});
  const [createAssessmentState, setCreateAssessmentState] = useState<
    DbBackedRequestState<CreateAssessmentUpdateResponse>
  >({ status: "idle" });
  const lastSubmittedAssessment = useRef<CreateAssessmentUpdateRequest | null>(
    null
  );
  const [timelineMode, setTimelineMode] = useState<TopicTimelineMode>("recent");
  const [timelineState, setTimelineState] = useState<
    DbBackedRequestState<ListTopicTimelineResponse>
  >({ status: "loading" });
  const timelineRunId = useRef(0);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceUrlError, setEvidenceUrlError] = useState<string | undefined>(
    undefined
  );
  const [captureEvidenceState, setCaptureEvidenceState] = useState<
    DbBackedRequestState<CaptureEvidenceUrlResponse>
  >({ status: "idle" });
  const lastSubmittedEvidenceCapture = useRef<CaptureEvidenceUrlRequest | null>(
    null
  );

  const isUpdating =
    updateState.status === "loading" || updateState.status === "waking";
  const isArchiving =
    archiveState.status === "loading" || archiveState.status === "waking";
  const isDeleting =
    deleteState.status === "loading" || deleteState.status === "waking";
  const isCreatingEvent =
    createEventState.status === "loading" ||
    createEventState.status === "waking";
  const isCreatingReviewNote =
    createReviewNoteState.status === "loading" ||
    createReviewNoteState.status === "waking";
  const isCreatingAssessment =
    createAssessmentState.status === "loading" ||
    createAssessmentState.status === "waking";
  const isCapturingEvidence =
    captureEvidenceState.status === "loading" ||
    captureEvidenceState.status === "waking";
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
            entries: sortEntries(response.entries)
          }
        });
      }
    } catch (error) {
      if (eventListRunId.current === runId) {
        setEventListState({ status: "error", error });
      }
    }
  }, [topic.id]);

  const loadReviewNotes = useCallback(async () => {
    const runId = reviewNoteListRunId.current + 1;
    reviewNoteListRunId.current = runId;
    setReviewNoteListState({ status: "loading" });

    try {
      const response = await listReviewNotes(
        { topicId: topic.id },
        {
          onProgress: (progress) => {
            if (reviewNoteListRunId.current === runId) {
              setReviewNoteListState({ status: progress.phase });
            }
          }
        }
      );

      if (reviewNoteListRunId.current === runId) {
        setReviewNoteListState({
          status: "success",
          data: {
            entries: sortEntries(response.entries)
          }
        });
      }
    } catch (error) {
      if (reviewNoteListRunId.current === runId) {
        setReviewNoteListState({ status: "error", error });
      }
    }
  }, [topic.id]);

  const loadTimeline = useCallback(
    async (mode: TopicTimelineMode) => {
      const runId = timelineRunId.current + 1;
      timelineRunId.current = runId;
      setTimelineState({ status: "loading" });

      try {
        const response = await listTopicTimeline(
          mode === "recent"
            ? {
                topicId: topic.id,
                limit: RECENT_TIMELINE_REQUEST_LIMIT
              }
            : { topicId: topic.id },
          {
            onProgress: (progress) => {
              if (timelineRunId.current === runId) {
                setTimelineState({ status: progress.phase });
              }
            }
          }
        );

        if (timelineRunId.current === runId) {
          setTimelineState({
            status: "success",
            data: response
          });
        }
      } catch (error) {
        if (timelineRunId.current === runId) {
          setTimelineState({ status: "error", error });
        }
      }
    },
    [topic.id]
  );

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

  useEffect(() => {
    void loadReviewNotes();

    return () => {
      reviewNoteListRunId.current += 1;
    };
  }, [loadReviewNotes]);

  useEffect(() => {
    setTimelineMode("recent");
    void loadTimeline("recent");

    return () => {
      timelineRunId.current += 1;
    };
  }, [loadTimeline]);

  useEffect(() => {
    setCurrentAssessment(initialCurrentAssessment);
  }, [initialCurrentAssessment, topic.id]);

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

  function updateReviewNoteField<FieldName extends keyof ReviewNoteFormValues>(
    fieldName: FieldName,
    value: ReviewNoteFormValues[FieldName]
  ) {
    setReviewNoteForm((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
    setReviewNoteFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined
    }));
  }

  function updateAssessmentField<FieldName extends keyof AssessmentFormValues>(
    fieldName: FieldName,
    value: AssessmentFormValues[FieldName]
  ) {
    setAssessmentForm((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
    setAssessmentFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined
    }));
  }

  function updateEvidenceUrl(value: string) {
    setEvidenceUrl(value);
    setEvidenceUrlError(undefined);
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

  function openReviewNoteForm() {
    setIsReviewNoteFormOpen(true);
    setCreateReviewNoteState({ status: "idle" });
    setReviewNoteFieldErrors({});
  }

  function cancelReviewNoteForm() {
    setIsReviewNoteFormOpen(false);
    setReviewNoteForm(defaultReviewNoteFormValues);
    setReviewNoteFieldErrors({});
    setCreateReviewNoteState({ status: "idle" });
    lastSubmittedReviewNote.current = null;
  }

  function openAssessmentForm() {
    setIsAssessmentFormOpen(true);
    setCreateAssessmentState({ status: "idle" });
    setAssessmentFieldErrors({});
  }

  function cancelAssessmentForm() {
    setIsAssessmentFormOpen(false);
    setAssessmentForm(defaultAssessmentFormValues);
    setAssessmentFieldErrors({});
    setCreateAssessmentState({ status: "idle" });
    lastSubmittedAssessment.current = null;
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
            entries: sortEntries([
              response.entry,
              ...currentState.data.entries.filter(
                (entry) => entry.id !== response.entry.id
              )
            ])
          }
        };
      });
      void loadTimeline(timelineMode);
    } catch (error) {
      setCreateEventState({ status: "error", error });
    }
  }

  async function handleCreateReviewNoteSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedRequest = createReviewNoteRequestSchema.safeParse({
      topicId: topic.id,
      title: reviewNoteForm.title,
      bodyMd: reviewNoteForm.bodyMd,
      sortAt: toEventSortAt(reviewNoteForm.sortDate),
      epistemicStatus: reviewNoteForm.epistemicStatus
    });

    if (!parsedRequest.success) {
      setReviewNoteFieldErrors(
        createReviewNoteFieldErrors(parsedRequest.error.issues)
      );
      setCreateReviewNoteState({ status: "idle" });
      return;
    }

    lastSubmittedReviewNote.current = parsedRequest.data;
    await submitReviewNote(parsedRequest.data);
  }

  async function retryCreateReviewNote() {
    if (!lastSubmittedReviewNote.current) {
      return;
    }

    await submitReviewNote(lastSubmittedReviewNote.current);
  }

  async function submitReviewNote(request: CreateReviewNoteRequest) {
    setReviewNoteFieldErrors({});
    setCreateReviewNoteState({ status: "loading" });

    try {
      const response = await createReviewNote(request, {
        onProgress: (progress) => {
          setCreateReviewNoteState({ status: progress.phase });
        }
      });

      setCreateReviewNoteState({ status: "success", data: response });
      setReviewNoteForm(defaultReviewNoteFormValues);
      setReviewNoteListState((currentState) => {
        if (currentState.status !== "success") {
          return {
            status: "success",
            data: { entries: [response.entry] }
          };
        }

        return {
          status: "success",
          data: {
            entries: sortEntries([
              response.entry,
              ...currentState.data.entries.filter(
                (entry) => entry.id !== response.entry.id
              )
            ])
          }
        };
      });
      void loadTimeline(timelineMode);
    } catch (error) {
      setCreateReviewNoteState({ status: "error", error });
    }
  }

  async function handleCreateAssessmentSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedRequest = createAssessmentUpdateRequestSchema.safeParse({
      topicId: topic.id,
      judgment: assessmentForm.judgment,
      confidenceLabel: assessmentForm.confidenceLabel,
      probabilityPct: parseOptionalInteger(assessmentForm.probabilityPct),
      assumptions: parseTextareaLines(assessmentForm.assumptions),
      indicators: parseTextareaLines(assessmentForm.indicators),
      resolutionCriteria: assessmentForm.resolutionCriteria,
      targetResolvesAt: toOptionalDateTime(assessmentForm.targetResolutionDate),
      sortAt: toEventSortAt(assessmentForm.assessmentDate)
    });

    if (!parsedRequest.success) {
      setAssessmentFieldErrors(
        createAssessmentFieldErrors(parsedRequest.error.issues)
      );
      setCreateAssessmentState({ status: "idle" });
      return;
    }

    lastSubmittedAssessment.current = parsedRequest.data;
    await submitAssessmentUpdate(parsedRequest.data);
  }

  async function retryCreateAssessment() {
    if (!lastSubmittedAssessment.current) {
      return;
    }

    await submitAssessmentUpdate(lastSubmittedAssessment.current);
  }

  async function submitAssessmentUpdate(
    request: CreateAssessmentUpdateRequest
  ) {
    setAssessmentFieldErrors({});
    setCreateAssessmentState({ status: "loading" });

    try {
      const response = await createAssessmentUpdate(request, {
        onProgress: (progress) => {
          setCreateAssessmentState({ status: progress.phase });
        }
      });

      setCreateAssessmentState({ status: "success", data: response });
      setCurrentAssessment(response.assessmentUpdate);
      setAssessmentForm(defaultAssessmentFormValues);
      void loadTimeline(timelineMode);
    } catch (error) {
      setCreateAssessmentState({ status: "error", error });
    }
  }

  async function handleCaptureEvidenceSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedRequest = captureEvidenceUrlRequestSchema.safeParse({
      url: evidenceUrl
    });

    if (!parsedRequest.success) {
      setEvidenceUrlError(
        evidenceUrl.trim()
          ? "Enter a valid http or https URL."
          : "Enter an evidence URL."
      );
      setCaptureEvidenceState({ status: "idle" });
      return;
    }

    lastSubmittedEvidenceCapture.current = parsedRequest.data;
    await submitEvidenceCapture(parsedRequest.data);
  }

  async function retryCaptureEvidence() {
    if (!lastSubmittedEvidenceCapture.current) {
      return;
    }

    await submitEvidenceCapture(lastSubmittedEvidenceCapture.current);
  }

  async function submitEvidenceCapture(request: CaptureEvidenceUrlRequest) {
    setEvidenceUrlError(undefined);
    setCaptureEvidenceState({ status: "loading" });

    try {
      const response = await captureEvidenceUrl(request, {
        onProgress: (progress) => {
          setCaptureEvidenceState({ status: progress.phase });
        }
      });

      setCaptureEvidenceState({ status: "success", data: response });
      setEvidenceUrl("");
    } catch (error) {
      setCaptureEvidenceState({ status: "error", error });
    }
  }

  function showFullTimeline() {
    setTimelineMode("full");
    void loadTimeline("full");
  }

  function showRecentTimeline() {
    setTimelineMode("recent");
    void loadTimeline("recent");
  }

  if (isEditing) {
    return (
      <form
        className="topic-form topic-edit-form"
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

      <CurrentAssessmentSection
        currentAssessment={currentAssessment}
        isFormOpen={isAssessmentFormOpen}
        formValues={assessmentForm}
        fieldErrors={assessmentFieldErrors}
        createState={createAssessmentState}
        isCreating={isCreatingAssessment}
        onOpenForm={openAssessmentForm}
        onCancelForm={cancelAssessmentForm}
        onUpdateField={updateAssessmentField}
        onSubmit={(event) => void handleCreateAssessmentSubmit(event)}
        onRetryCreate={() => void retryCreateAssessment()}
      />

      <TopicTimelineSection
        timelineState={timelineState}
        mode={timelineMode}
        onRetry={() => void loadTimeline(timelineMode)}
        onShowFull={showFullTimeline}
        onShowRecent={showRecentTimeline}
      />

      <EvidenceCaptureSection
        evidenceUrl={evidenceUrl}
        evidenceUrlError={evidenceUrlError}
        captureState={captureEvidenceState}
        isCapturing={isCapturingEvidence}
        onUpdateEvidenceUrl={updateEvidenceUrl}
        onSubmit={(event) => void handleCaptureEvidenceSubmit(event)}
        onRetryCapture={() => void retryCaptureEvidence()}
      />

      <ReviewNotesSection
        entries={
          reviewNoteListState.status === "success"
            ? reviewNoteListState.data.entries
            : []
        }
        reviewNoteListState={reviewNoteListState}
        isReviewNoteFormOpen={isReviewNoteFormOpen}
        formValues={reviewNoteForm}
        fieldErrors={reviewNoteFieldErrors}
        createState={createReviewNoteState}
        isCreating={isCreatingReviewNote}
        onOpenForm={openReviewNoteForm}
        onCancelForm={cancelReviewNoteForm}
        onUpdateField={updateReviewNoteField}
        onSubmit={(event) => void handleCreateReviewNoteSubmit(event)}
        onRetryList={() => void loadReviewNotes()}
        onRetryCreate={() => void retryCreateReviewNote()}
      />

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

      <section className="topic-lifecycle-panel">
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

      <section className="danger-zone">
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

function EvidenceCaptureSection({
  evidenceUrl,
  evidenceUrlError,
  captureState,
  isCapturing,
  onUpdateEvidenceUrl,
  onSubmit,
  onRetryCapture
}: {
  evidenceUrl: string;
  evidenceUrlError: string | undefined;
  captureState: DbBackedRequestState<CaptureEvidenceUrlResponse>;
  isCapturing: boolean;
  onUpdateEvidenceUrl: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRetryCapture: () => void;
}) {
  const urlErrorId = "evidence-url-error";
  const capturedRecord =
    captureState.status === "success" ? captureState.data : null;

  return (
    <section className="evidence-capture">
      <div className="evidence-capture__header">
        <div>
          <p className="eyebrow">Evidence</p>
          <h3 id="evidence-capture-title">Capture URL evidence</h3>
          <p>
            Paste a source URL to save a reusable evidence item before attaching
            citations later.
          </p>
        </div>
      </div>

      <form
        className="evidence-capture-form"
        aria-label="Capture URL evidence"
        noValidate
        onSubmit={onSubmit}
      >
        <label className="form-field" htmlFor="evidence-url">
          <span>Evidence URL</span>
          <input
            id="evidence-url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/source"
            value={evidenceUrl}
            disabled={isCapturing}
            aria-invalid={evidenceUrlError ? true : undefined}
            aria-describedby={evidenceUrlError ? urlErrorId : undefined}
            onChange={(event) => onUpdateEvidenceUrl(event.target.value)}
          />
          {evidenceUrlError ? (
            <span className="field-error" id={urlErrorId}>
              {evidenceUrlError}
            </span>
          ) : null}
        </label>

        <button className="primary-action" type="submit" disabled={isCapturing}>
          {isCapturing ? "Saving evidence..." : "Save evidence"}
        </button>

        <DbWakeUpStatus state={captureState} onRetry={onRetryCapture} />
      </form>

      {capturedRecord ? (
        <EvidenceCaptureResult record={capturedRecord} />
      ) : null}
    </section>
  );
}

function EvidenceCaptureResult({
  record
}: {
  record: CaptureEvidenceUrlResponse;
}) {
  const canonicalUrl = record.evidenceItem.canonicalUrl;

  return (
    <article className="evidence-capture-result" aria-live="polite">
      <p className="status-text evidence-capture-result__status">
        Evidence saved or reused.
      </p>
      <h4>{record.evidenceItem.title}</h4>
      <dl className="evidence-capture-result__metadata">
        <div>
          <dt>Source</dt>
          <dd>{record.source.canonicalName}</dd>
        </div>
        {canonicalUrl ? (
          <div>
            <dt>Canonical URL</dt>
            <dd>
              <a href={canonicalUrl} target="_blank" rel="noreferrer">
                {canonicalUrl}
              </a>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Captured</dt>
          <dd>{formatTopicDate(record.evidenceItem.capturedAt)}</dd>
        </div>
        <div>
          <dt>Evidence ID</dt>
          <dd>{record.evidenceItem.id}</dd>
        </div>
        <div>
          <dt>Source ID</dt>
          <dd>{record.source.id}</dd>
        </div>
      </dl>
    </article>
  );
}

function EntryCitationPanel({ entry }: { entry: Entry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [citationState, setCitationState] = useState<
    DbBackedRequestState<ListEntryCitationsResponse>
  >({ status: "loading" });
  const [evidenceListState, setEvidenceListState] = useState<
    DbBackedRequestState<ListEvidenceItemsResponse>
  >({ status: "idle" });
  const [anchorListState, setAnchorListState] = useState<
    DbBackedRequestState<ListEvidenceAnchorsForItemResponse>
  >({ status: "idle" });
  const [mutationState, setMutationState] = useState<
    DbBackedRequestState<
      AttachEntryCitationResponse | DetachEntryCitationResponse
    >
  >({ status: "idle" });
  const [citationForm, setCitationForm] = useState<CitationFormValues>(
    defaultCitationFormValues
  );
  const citationRunId = useRef(0);
  const evidenceRunId = useRef(0);
  const anchorRunId = useRef(0);

  const isMutating =
    mutationState.status === "loading" || mutationState.status === "waking";
  const selectedEvidence =
    evidenceListState.status === "success"
      ? evidenceListState.data.evidence.find(
          (record) => record.evidenceItem.id === citationForm.evidenceItemId
        )
      : undefined;
  const anchorOptions =
    anchorListState.status === "success" ? anchorListState.data.anchors : [];
  const citations =
    citationState.status === "success" ? citationState.data.citations : [];
  const canAttach = citationForm.evidenceItemId !== "" && !isMutating;

  const loadCitations = useCallback(async () => {
    const runId = citationRunId.current + 1;
    citationRunId.current = runId;
    setCitationState({ status: "loading" });

    try {
      const response = await listEntryCitations(
        { entryId: entry.id },
        {
          onProgress: (progress) => {
            if (citationRunId.current === runId) {
              setCitationState({ status: progress.phase });
            }
          }
        }
      );

      if (citationRunId.current === runId) {
        setCitationState({ status: "success", data: response });
      }
    } catch (error) {
      if (citationRunId.current === runId) {
        setCitationState({ status: "error", error });
      }
    }
  }, [entry.id]);

  const loadEvidenceItems = useCallback(async () => {
    const runId = evidenceRunId.current + 1;
    evidenceRunId.current = runId;
    setEvidenceListState({ status: "loading" });

    try {
      const response = await listEvidenceItems(
        { query: undefined },
        {
          onProgress: (progress) => {
            if (evidenceRunId.current === runId) {
              setEvidenceListState({ status: progress.phase });
            }
          }
        }
      );

      if (evidenceRunId.current === runId) {
        setEvidenceListState({ status: "success", data: response });
      }
    } catch (error) {
      if (evidenceRunId.current === runId) {
        setEvidenceListState({ status: "error", error });
      }
    }
  }, []);

  const loadAnchors = useCallback(async (evidenceItemId: string) => {
    const runId = anchorRunId.current + 1;
    anchorRunId.current = runId;
    setAnchorListState({ status: "loading" });

    try {
      const response = await listEvidenceAnchorsForItem(
        { evidenceItemId },
        {
          onProgress: (progress) => {
            if (anchorRunId.current === runId) {
              setAnchorListState({ status: progress.phase });
            }
          }
        }
      );

      if (anchorRunId.current === runId) {
        setAnchorListState({ status: "success", data: response });
      }
    } catch (error) {
      if (anchorRunId.current === runId) {
        setAnchorListState({ status: "error", error });
      }
    }
  }, []);

  useEffect(() => {
    void loadCitations();

    return () => {
      citationRunId.current += 1;
    };
  }, [loadCitations]);

  useEffect(() => {
    if (!isOpen || evidenceListState.status !== "idle") {
      return;
    }

    void loadEvidenceItems();
  }, [evidenceListState.status, isOpen, loadEvidenceItems]);

  useEffect(() => {
    if (!isOpen || !citationForm.evidenceItemId) {
      anchorRunId.current += 1;
      setAnchorListState({ status: "idle" });
      return;
    }

    void loadAnchors(citationForm.evidenceItemId);
  }, [citationForm.evidenceItemId, isOpen, loadAnchors]);

  function updateEvidenceItemId(evidenceItemId: string) {
    setCitationForm((currentValues) => ({
      ...currentValues,
      evidenceItemId,
      evidenceAnchorId: ""
    }));
    setMutationState({ status: "idle" });
  }

  function updateCitationForm<FieldName extends keyof CitationFormValues>(
    fieldName: FieldName,
    value: CitationFormValues[FieldName]
  ) {
    setCitationForm((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
    setMutationState({ status: "idle" });
  }

  async function submitCitationAttach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCitationAttachRequest();
  }

  async function submitCitationAttachRequest() {
    if (!citationForm.evidenceItemId) {
      return;
    }

    setMutationState({ status: "loading" });

    try {
      const response = await attachEntryCitation(
        {
          entryId: entry.id,
          evidenceItemId: citationForm.evidenceItemId,
          evidenceAnchorId: citationForm.evidenceAnchorId || undefined,
          relationType: "supports",
          note: citationForm.note || undefined
        },
        {
          onProgress: (progress) => {
            setMutationState({ status: progress.phase });
          }
        }
      );

      setMutationState({ status: "success", data: response });
      setCitationForm(defaultCitationFormValues);
      setCitationState((currentState) => {
        const existingCitations =
          currentState.status === "success" ? currentState.data.citations : [];

        return {
          status: "success",
          data: {
            citations: [
              response.citation,
              ...existingCitations.filter(
                (record) => record.citation.id !== response.citation.citation.id
              )
            ]
          }
        };
      });
    } catch (error) {
      setMutationState({ status: "error", error });
    }
  }

  async function submitCitationDetach(citationId: string) {
    setMutationState({ status: "loading" });

    try {
      const response = await detachEntryCitation(
        {
          entryId: entry.id,
          citationId
        },
        {
          onProgress: (progress) => {
            setMutationState({ status: progress.phase });
          }
        }
      );

      setMutationState({ status: "success", data: response });
      setCitationState((currentState) => {
        const existingCitations =
          currentState.status === "success" ? currentState.data.citations : [];

        return {
          status: "success",
          data: {
            citations: existingCitations.filter(
              (record) => record.citation.id !== citationId
            )
          }
        };
      });
    } catch (error) {
      setMutationState({ status: "error", error });
    }
  }

  return (
    <div className="entry-citations">
      <div className="entry-citations__summary">
        <span className="entry-citations__badge">
          {formatCitationBadge(citationState)}
        </span>
        <button
          className="text-action"
          type="button"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          {isOpen ? "Hide citations" : "Manage citations"}
        </button>
      </div>

      {citationState.status === "error" ? (
        <DbWakeUpStatus
          state={citationState}
          onRetry={() => void loadCitations()}
        />
      ) : null}

      {isOpen ? (
        <div className="entry-citations__panel">
          {citationState.status === "loading" ? (
            <p className="status-text" role="status">
              Loading citations...
            </p>
          ) : null}
          <DbWakeUpStatus
            state={citationState}
            onRetry={() => void loadCitations()}
          />

          {citationState.status === "success" && citations.length > 0 ? (
            <ul className="entry-citations__list" aria-label="Entry citations">
              {citations.map((record) => (
                <CitationListItem
                  key={record.citation.id}
                  record={record}
                  isMutating={isMutating}
                  onDetach={() => void submitCitationDetach(record.citation.id)}
                />
              ))}
            </ul>
          ) : null}

          {citationState.status === "success" && citations.length === 0 ? (
            <p className="entry-citations__empty">
              No citations attached to this entry yet.
            </p>
          ) : null}

          {evidenceListState.status === "loading" ? (
            <p className="status-text" role="status">
              Loading saved evidence...
            </p>
          ) : null}
          <DbWakeUpStatus
            state={evidenceListState}
            onRetry={() => void loadEvidenceItems()}
          />

          {evidenceListState.status === "success" &&
          evidenceListState.data.evidence.length === 0 ? (
            <p className="entry-citations__empty">
              No saved evidence available. Save URL evidence before attaching a
              citation.
            </p>
          ) : null}

          {evidenceListState.status === "success" &&
          evidenceListState.data.evidence.length > 0 ? (
            <form
              className="entry-citations__form"
              aria-label={`Attach citation to ${entry.title}`}
              onSubmit={(event) => void submitCitationAttach(event)}
            >
              <label className="form-field" htmlFor={`${entry.id}-evidence`}>
                <span>Saved evidence</span>
                <select
                  id={`${entry.id}-evidence`}
                  value={citationForm.evidenceItemId}
                  disabled={isMutating}
                  onChange={(event) => updateEvidenceItemId(event.target.value)}
                >
                  <option value="">Choose saved evidence</option>
                  {evidenceListState.data.evidence.map((record) => (
                    <option
                      key={record.evidenceItem.id}
                      value={record.evidenceItem.id}
                    >
                      {formatEvidenceOption(record)}
                    </option>
                  ))}
                </select>
              </label>

              {selectedEvidence ? (
                <p className="entry-citations__selected-evidence">
                  {formatEvidenceDetail(selectedEvidence)}
                </p>
              ) : null}

              <label className="form-field" htmlFor={`${entry.id}-anchor`}>
                <span>Anchor</span>
                <select
                  id={`${entry.id}-anchor`}
                  value={citationForm.evidenceAnchorId}
                  disabled={
                    isMutating ||
                    !citationForm.evidenceItemId ||
                    anchorListState.status !== "success" ||
                    anchorOptions.length === 0
                  }
                  onChange={(event) =>
                    updateCitationForm("evidenceAnchorId", event.target.value)
                  }
                >
                  <option value="">Whole evidence item</option>
                  {anchorOptions.map((anchor) => (
                    <option key={anchor.id} value={anchor.id}>
                      {formatEvidenceAnchor(anchor)}
                    </option>
                  ))}
                </select>
              </label>

              {anchorListState.status === "loading" ? (
                <p className="status-text" role="status">
                  Loading anchors...
                </p>
              ) : null}
              <DbWakeUpStatus
                state={anchorListState}
                onRetry={() => {
                  if (citationForm.evidenceItemId) {
                    void loadAnchors(citationForm.evidenceItemId);
                  }
                }}
              />

              <label
                className="form-field"
                htmlFor={`${entry.id}-citation-note`}
              >
                <span>Note</span>
                <textarea
                  id={`${entry.id}-citation-note`}
                  rows={2}
                  value={citationForm.note}
                  disabled={isMutating}
                  onChange={(event) =>
                    updateCitationForm("note", event.target.value)
                  }
                />
              </label>

              <button
                className="secondary-action"
                type="submit"
                disabled={!canAttach}
              >
                {isMutating ? "Saving citation..." : "Attach citation"}
              </button>

              <DbWakeUpStatus
                state={mutationState}
                onRetry={() => void submitCitationAttachRequest()}
              />
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CitationListItem({
  record,
  isMutating,
  onDetach
}: {
  record: EntryCitationRecord;
  isMutating: boolean;
  onDetach: () => void;
}) {
  return (
    <li className="entry-citations__item">
      <div>
        <strong>{record.evidence.evidenceItem.title}</strong>
        <p>
          {formatCitationRelation(record.citation.relationType)} evidence from{" "}
          {record.evidence.source.canonicalName}
          {record.anchor ? `, ${formatEvidenceAnchor(record.anchor)}` : ""}.
        </p>
        {record.evidence.evidenceItem.canonicalUrl ? (
          <a
            href={record.evidence.evidenceItem.canonicalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {record.evidence.evidenceItem.canonicalUrl}
          </a>
        ) : null}
        {record.citation.note ? <p>{record.citation.note}</p> : null}
      </div>
      <button
        className="text-action"
        type="button"
        disabled={isMutating}
        onClick={onDetach}
      >
        Remove citation
      </button>
    </li>
  );
}

function TopicTimelineSection({
  timelineState,
  mode,
  onRetry,
  onShowFull,
  onShowRecent
}: {
  timelineState: DbBackedRequestState<ListTopicTimelineResponse>;
  mode: TopicTimelineMode;
  onRetry: () => void;
  onShowFull: () => void;
  onShowRecent: () => void;
}) {
  const items =
    timelineState.status === "success"
      ? getVisibleTimelineItems(timelineState.data.items, mode)
      : [];
  const hasFullHistory =
    mode === "recent" &&
    timelineState.status === "success" &&
    timelineState.data.items.length > RECENT_TIMELINE_VISIBLE_COUNT;

  return (
    <section className="topic-timeline">
      <div className="topic-timeline__header">
        <div>
          <p className="eyebrow">Timeline</p>
          <h3 id="topic-timeline-title">Topic timeline</h3>
          <p>
            Recent Events, Assessment Updates, and Review Notes in one
            chronology.
          </p>
        </div>
        {mode === "full" ? (
          <button
            className="secondary-action"
            type="button"
            onClick={onShowRecent}
          >
            Show recent timeline
          </button>
        ) : hasFullHistory ? (
          <button
            className="secondary-action"
            type="button"
            onClick={onShowFull}
          >
            View full history
          </button>
        ) : null}
      </div>

      {timelineState.status === "loading" ? (
        <p className="status-text topic-timeline__status" role="status">
          Loading topic timeline...
        </p>
      ) : null}
      <DbWakeUpStatus state={timelineState} onRetry={onRetry} />

      {timelineState.status === "success" && items.length === 0 ? (
        <p className="topic-timeline__empty">
          No timeline entries yet. Add events, assessment updates, or review
          notes to build this dossier history.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="topic-timeline__list" aria-label="Topic timeline">
          {items.map((item) => (
            <TimelineItemCard item={item} key={item.entry.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TimelineItemCard({ item }: { item: TopicTimelineItem }) {
  const entry = item.entry;

  return (
    <article
      className={`topic-timeline-card topic-timeline-card--${item.kind}`}
    >
      <div className="topic-timeline-card__metadata">
        <span>{formatTimelineItemKind(item.kind)}</span>
        <time dateTime={entry.sortAt}>{formatTopicDate(entry.sortAt)}</time>
        {item.kind === "assessment" ? (
          <>
            <span>
              {formatAssessmentConfidence(item.assessment.confidenceLabel)}
            </span>
            {item.assessment.probabilityPct !== undefined ? (
              <span>{item.assessment.probabilityPct}% probability</span>
            ) : null}
          </>
        ) : (
          <span>{formatEpistemicStatus(entry.epistemicStatus)}</span>
        )}
      </div>
      <h4>{entry.title}</h4>
      <p>
        {item.kind === "assessment" ? item.assessment.judgment : entry.bodyMd}
      </p>
      {item.kind === "assessment" ? (
        <>
          <AssessmentList
            title="Assumptions"
            items={item.assessment.assumptions}
          />
          <AssessmentList
            title="Indicators"
            items={item.assessment.indicators}
          />
        </>
      ) : null}
      <EntryCitationPanel entry={entry} />
    </article>
  );
}

function ReviewNotesSection({
  entries,
  reviewNoteListState,
  isReviewNoteFormOpen,
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
  reviewNoteListState: DbBackedRequestState<ListReviewNotesResponse>;
  isReviewNoteFormOpen: boolean;
  formValues: ReviewNoteFormValues;
  fieldErrors: ReviewNoteFieldErrors;
  createState: DbBackedRequestState<CreateReviewNoteResponse>;
  isCreating: boolean;
  onOpenForm: () => void;
  onCancelForm: () => void;
  onUpdateField: <FieldName extends keyof ReviewNoteFormValues>(
    fieldName: FieldName,
    value: ReviewNoteFormValues[FieldName]
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRetryList: () => void;
  onRetryCreate: () => void;
}) {
  return (
    <section className="review-notes">
      <div className="review-notes__header">
        <div>
          <p className="eyebrow">Review notes</p>
          <h3 id="review-notes-title">Review notes</h3>
          <p>
            Capture what you noticed or concluded while revisiting this dossier.
            Events and assessment updates stay separate.
          </p>
        </div>
        {isReviewNoteFormOpen ? null : (
          <button
            className="secondary-action"
            type="button"
            onClick={onOpenForm}
          >
            Add review note
          </button>
        )}
      </div>

      {isReviewNoteFormOpen ? (
        <form
          className="review-note-form"
          aria-label="Add review note"
          onSubmit={onSubmit}
        >
          <div className="review-note-form__header">
            <h4>Add review note</h4>
            <button
              className="text-action"
              type="button"
              disabled={isCreating}
              onClick={onCancelForm}
            >
              Cancel
            </button>
          </div>
          <ReviewNoteFields
            values={formValues}
            fieldErrors={fieldErrors}
            onUpdateField={onUpdateField}
          />
          <button
            className="primary-action"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Saving review note..." : "Save review note"}
          </button>
          {createState.status === "success" ? (
            <p className="status-text review-note-form__success" role="status">
              Review note saved.
            </p>
          ) : null}
          <DbWakeUpStatus state={createState} onRetry={onRetryCreate} />
        </form>
      ) : null}

      {reviewNoteListState.status === "loading" ? (
        <p className="status-text review-notes__status" role="status">
          Loading review notes...
        </p>
      ) : null}
      <DbWakeUpStatus state={reviewNoteListState} onRetry={onRetryList} />

      {reviewNoteListState.status === "success" && entries.length === 0 ? (
        <p className="review-notes__empty">
          No review notes yet. Add a dated reflection when you revisit this
          dossier.
        </p>
      ) : null}

      {entries.length > 0 ? (
        <div className="review-note-list" aria-label="Review notes">
          {entries.map((entry) => (
            <article className="review-note-card" key={entry.id}>
              <div className="review-note-card__metadata">
                <time dateTime={entry.sortAt}>
                  {formatTopicDate(entry.sortAt)}
                </time>
                <span>{formatEpistemicStatus(entry.epistemicStatus)}</span>
              </div>
              <h4>{entry.title}</h4>
              <p>{entry.bodyMd}</p>
              <EntryCitationPanel entry={entry} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
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
    <section className="event-entries">
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
              </div>
              <h4>{entry.title}</h4>
              <p>{entry.bodyMd}</p>
              <EntryCitationPanel entry={entry} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CurrentAssessmentSection({
  currentAssessment,
  isFormOpen,
  formValues,
  fieldErrors,
  createState,
  isCreating,
  onOpenForm,
  onCancelForm,
  onUpdateField,
  onSubmit,
  onRetryCreate
}: {
  currentAssessment: AssessmentUpdate | null;
  isFormOpen: boolean;
  formValues: AssessmentFormValues;
  fieldErrors: AssessmentFieldErrors;
  createState: DbBackedRequestState<CreateAssessmentUpdateResponse>;
  isCreating: boolean;
  onOpenForm: () => void;
  onCancelForm: () => void;
  onUpdateField: <FieldName extends keyof AssessmentFormValues>(
    fieldName: FieldName,
    value: AssessmentFormValues[FieldName]
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRetryCreate: () => void;
}) {
  return (
    <section className="current-assessment">
      <div className="current-assessment__header">
        <div>
          <p className="eyebrow">Assessment</p>
          <h3 id="current-assessment-title">Current assessment</h3>
          <p>
            This is derived from the latest active assessment update in the
            topic history.
          </p>
        </div>
        {isFormOpen ? null : (
          <button
            className="secondary-action"
            type="button"
            onClick={onOpenForm}
          >
            {currentAssessment ? "Update assessment" : "Add assessment"}
          </button>
        )}
      </div>

      {currentAssessment ? (
        <article
          className="current-assessment-card"
          aria-label="Current assessment"
        >
          <div className="current-assessment-card__metadata">
            <time dateTime={currentAssessment.entry.sortAt}>
              {formatTopicDate(currentAssessment.entry.sortAt)}
            </time>
            <span>
              {formatAssessmentConfidence(currentAssessment.confidenceLabel)}
            </span>
            {currentAssessment.probabilityPct !== undefined ? (
              <span>{currentAssessment.probabilityPct}% probability</span>
            ) : null}
          </div>
          <h4>{currentAssessment.entry.title}</h4>
          <p>{currentAssessment.judgment}</p>
          <AssessmentList
            title="Assumptions"
            items={currentAssessment.assumptions}
          />
          <AssessmentList
            title="Indicators"
            items={currentAssessment.indicators}
          />
          <EntryCitationPanel entry={currentAssessment.entry} />
          {currentAssessment.resolutionCriteria ||
          currentAssessment.targetResolvesAt ? (
            <dl className="current-assessment-card__resolution">
              {currentAssessment.resolutionCriteria ? (
                <div>
                  <dt>Resolution criteria</dt>
                  <dd>{currentAssessment.resolutionCriteria}</dd>
                </div>
              ) : null}
              {currentAssessment.targetResolvesAt ? (
                <div>
                  <dt>Target resolution date</dt>
                  <dd>{formatTopicDate(currentAssessment.targetResolvesAt)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </article>
      ) : (
        <div className="current-assessment-empty">
          <h4>No assessment yet</h4>
          <p>
            Add an assessment update to record your current judgment,
            confidence, assumptions, and indicators for this dossier.
          </p>
        </div>
      )}

      {isFormOpen ? (
        <form
          className="assessment-form"
          aria-label="Add assessment update"
          onSubmit={onSubmit}
        >
          <div className="assessment-form__header">
            <h4>Add assessment update</h4>
            <button
              className="text-action"
              type="button"
              disabled={isCreating}
              onClick={onCancelForm}
            >
              Cancel
            </button>
          </div>
          <AssessmentFields
            values={formValues}
            fieldErrors={fieldErrors}
            onUpdateField={onUpdateField}
          />
          <button
            className="primary-action"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Saving assessment..." : "Save assessment"}
          </button>
          {createState.status === "success" ? (
            <p className="status-text assessment-form__success" role="status">
              Assessment saved.
            </p>
          ) : null}
          <DbWakeUpStatus state={createState} onRetry={onRetryCreate} />
        </form>
      ) : null}
    </section>
  );
}

function AssessmentList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="current-assessment-card__list">
      <h5>{title}</h5>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AssessmentFields({
  values,
  fieldErrors,
  onUpdateField
}: {
  values: AssessmentFormValues;
  fieldErrors: AssessmentFieldErrors;
  onUpdateField: <FieldName extends keyof AssessmentFormValues>(
    fieldName: FieldName,
    value: AssessmentFormValues[FieldName]
  ) => void;
}) {
  const judgmentErrorId = "assessment-judgment-error";
  const confidenceErrorId = "assessment-confidence-error";
  const dateErrorId = "assessment-date-error";
  const assumptionsErrorId = "assessment-assumptions-error";
  const indicatorsErrorId = "assessment-indicators-error";
  const probabilityErrorId = "assessment-probability-error";

  return (
    <>
      <label className="form-field" htmlFor="assessment-judgment">
        <span>Judgment</span>
        <textarea
          id="assessment-judgment"
          rows={4}
          value={values.judgment}
          aria-invalid={fieldErrors.judgment ? "true" : undefined}
          aria-describedby={fieldErrors.judgment ? judgmentErrorId : undefined}
          onChange={(event) => onUpdateField("judgment", event.target.value)}
        />
        {fieldErrors.judgment ? (
          <span className="field-error" id={judgmentErrorId}>
            {fieldErrors.judgment}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="assessment-confidence">
        <span>Confidence</span>
        <select
          id="assessment-confidence"
          value={values.confidenceLabel}
          aria-invalid={fieldErrors.confidenceLabel ? "true" : undefined}
          aria-describedby={
            fieldErrors.confidenceLabel ? confidenceErrorId : undefined
          }
          onChange={(event) =>
            onUpdateField(
              "confidenceLabel",
              event.target.value as AssessmentConfidenceLabel | ""
            )
          }
        >
          <option value="">Choose confidence</option>
          {assessmentConfidenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.confidenceLabel ? (
          <span className="field-error" id={confidenceErrorId}>
            {fieldErrors.confidenceLabel}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="assessment-date">
        <span>Assessment date</span>
        <input
          id="assessment-date"
          type="date"
          value={values.assessmentDate}
          aria-invalid={fieldErrors.assessmentDate ? "true" : undefined}
          aria-describedby={
            fieldErrors.assessmentDate ? dateErrorId : undefined
          }
          onChange={(event) =>
            onUpdateField("assessmentDate", event.target.value)
          }
        />
        {fieldErrors.assessmentDate ? (
          <span className="field-error" id={dateErrorId}>
            {fieldErrors.assessmentDate}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="assessment-assumptions">
        <span>Assumptions</span>
        <textarea
          id="assessment-assumptions"
          rows={4}
          value={values.assumptions}
          aria-invalid={fieldErrors.assumptions ? "true" : undefined}
          aria-describedby={
            fieldErrors.assumptions ? assumptionsErrorId : undefined
          }
          onChange={(event) => onUpdateField("assumptions", event.target.value)}
        />
        {fieldErrors.assumptions ? (
          <span className="field-error" id={assumptionsErrorId}>
            {fieldErrors.assumptions}
          </span>
        ) : null}
      </label>

      <label className="form-field" htmlFor="assessment-indicators">
        <span>Indicators</span>
        <textarea
          id="assessment-indicators"
          rows={4}
          value={values.indicators}
          aria-invalid={fieldErrors.indicators ? "true" : undefined}
          aria-describedby={
            fieldErrors.indicators ? indicatorsErrorId : undefined
          }
          onChange={(event) => onUpdateField("indicators", event.target.value)}
        />
        {fieldErrors.indicators ? (
          <span className="field-error" id={indicatorsErrorId}>
            {fieldErrors.indicators}
          </span>
        ) : null}
      </label>

      <details className="assessment-form__advanced">
        <summary>Advanced fields</summary>
        <label className="form-field" htmlFor="assessment-probability">
          <span>Probability</span>
          <input
            id="assessment-probability"
            type="number"
            min="0"
            max="100"
            step="any"
            value={values.probabilityPct}
            aria-invalid={fieldErrors.probabilityPct ? "true" : undefined}
            aria-describedby={
              fieldErrors.probabilityPct ? probabilityErrorId : undefined
            }
            onChange={(event) =>
              onUpdateField("probabilityPct", event.target.value)
            }
          />
          {fieldErrors.probabilityPct ? (
            <span className="field-error" id={probabilityErrorId}>
              {fieldErrors.probabilityPct}
            </span>
          ) : null}
        </label>

        <label className="form-field" htmlFor="assessment-resolution-criteria">
          <span>Resolution criteria</span>
          <textarea
            id="assessment-resolution-criteria"
            rows={3}
            value={values.resolutionCriteria}
            onChange={(event) =>
              onUpdateField("resolutionCriteria", event.target.value)
            }
          />
        </label>

        <label className="form-field" htmlFor="assessment-target-resolution">
          <span>Target resolution date</span>
          <input
            id="assessment-target-resolution"
            type="date"
            value={values.targetResolutionDate}
            onChange={(event) =>
              onUpdateField("targetResolutionDate", event.target.value)
            }
          />
        </label>
      </details>
    </>
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

function ReviewNoteFields({
  values,
  fieldErrors,
  onUpdateField
}: {
  values: ReviewNoteFormValues;
  fieldErrors: ReviewNoteFieldErrors;
  onUpdateField: <FieldName extends keyof ReviewNoteFormValues>(
    fieldName: FieldName,
    value: ReviewNoteFormValues[FieldName]
  ) => void;
}) {
  const titleErrorId = "review-note-title-error";
  const bodyErrorId = "review-note-body-error";
  const dateErrorId = "review-note-date-error";
  const epistemicStatusErrorId = "review-note-epistemic-status-error";

  return (
    <>
      <label className="form-field" htmlFor="review-note-title">
        <span>Review note title</span>
        <input
          id="review-note-title"
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

      <label className="form-field" htmlFor="review-note-body">
        <span>Review note</span>
        <textarea
          id="review-note-body"
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

      <label className="form-field" htmlFor="review-note-date">
        <span>Review date</span>
        <input
          id="review-note-date"
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

      <label className="form-field" htmlFor="review-note-epistemic-status">
        <span>Epistemic label</span>
        <select
          id="review-note-epistemic-status"
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
    <section className="topic-empty-state">
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
    <section className="topic-empty-state">
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

function createReviewNoteFieldErrors(
  issues: Array<{ path: PropertyKey[] }>
): ReviewNoteFieldErrors {
  const errors: ReviewNoteFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];

    if (fieldName === "title") {
      errors.title = "Enter a review note title.";
    }

    if (fieldName === "bodyMd") {
      errors.bodyMd = "Enter a review note.";
    }

    if (fieldName === "sortAt") {
      errors.sortDate = "Choose a review date.";
    }

    if (fieldName === "epistemicStatus") {
      errors.epistemicStatus = "Choose a valid epistemic label.";
    }
  }

  return errors;
}

function createAssessmentFieldErrors(
  issues: Array<{ path: PropertyKey[] }>
): AssessmentFieldErrors {
  const errors: AssessmentFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];

    if (fieldName === "judgment") {
      errors.judgment = "Enter an assessment judgment.";
    }

    if (fieldName === "confidenceLabel") {
      errors.confidenceLabel = "Choose a valid confidence label.";
    }

    if (fieldName === "sortAt") {
      errors.assessmentDate = "Choose an assessment date.";
    }

    if (fieldName === "assumptions") {
      errors.assumptions = "Enter at least one assumption.";
    }

    if (fieldName === "indicators") {
      errors.indicators = "Enter at least one indicator.";
    }

    if (fieldName === "probabilityPct") {
      errors.probabilityPct = "Enter a whole-number probability from 0 to 100.";
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

function formatAssessmentConfidence(
  confidenceLabel: AssessmentConfidenceLabel
): string {
  return (
    assessmentConfidenceOptions.find(
      (option) => option.value === confidenceLabel
    )?.label ?? confidenceLabel
  );
}

function formatTimelineItemKind(kind: TopicTimelineItem["kind"]): string {
  if (kind === "assessment") {
    return "Assessment update";
  }

  if (kind === "review") {
    return "Review note";
  }

  return "Event";
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

function formatCitationBadge(
  state: DbBackedRequestState<ListEntryCitationsResponse>
): string {
  if (state.status === "success") {
    const count = state.data.citations.length;

    if (count === 0) {
      return "Uncited";
    }

    return count === 1 ? "1 citation" : `${count} citations`;
  }

  if (state.status === "error") {
    return "Citation status unavailable";
  }

  return "Checking citations";
}

function formatCitationRelation(
  relationType: EntryCitationRecord["citation"]["relationType"]
): string {
  if (relationType === "source_for") {
    return "Source for";
  }

  return relationType.charAt(0).toUpperCase() + relationType.slice(1);
}

function formatEvidenceOption(record: EvidenceRecord): string {
  return `${record.evidenceItem.title} - ${record.source.canonicalName}`;
}

function formatEvidenceDetail(record: EvidenceRecord): string {
  return record.evidenceItem.canonicalUrl
    ? `${record.source.canonicalName}: ${record.evidenceItem.canonicalUrl}`
    : record.source.canonicalName;
}

function formatEvidenceAnchor(anchor: EvidenceAnchor): string {
  if (anchor.quoteText) {
    return `Quote: ${anchor.quoteText}`;
  }

  if (anchor.pageLabel) {
    return `Page ${anchor.pageLabel}`;
  }

  if (anchor.startPos !== undefined && anchor.endPos !== undefined) {
    return `Text range ${anchor.startPos}-${anchor.endPos}`;
  }

  return "Anchor details";
}

function toEventSortAt(sortDate: string): string {
  if (!sortDate) {
    return "";
  }

  return `${sortDate}T00:00:00.000Z`;
}

function toOptionalDateTime(dateValue: string): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  return toEventSortAt(dateValue);
}

function parseOptionalInteger(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  return Number(value);
}

function parseTextareaLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function sortEntries(entries: Entry[]): Entry[] {
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

function getVisibleTimelineItems(
  items: TopicTimelineItem[],
  mode: TopicTimelineMode
): TopicTimelineItem[] {
  if (mode === "full") {
    return items;
  }

  return items.slice(0, RECENT_TIMELINE_VISIBLE_COUNT);
}
