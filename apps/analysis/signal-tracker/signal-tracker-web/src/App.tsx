import {
  createTopicRequestSchema,
  type CreateTopicRequest,
  type CreateTopicResponse,
  type ReviewCadence,
  type Topic
} from "@repo/signal-tracker-shared";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { createTopic } from "./api/topics";
import { DbWakeUpStatus } from "./dbWakeUp/DbWakeUpStatus";
import type { DbBackedRequestState } from "./dbWakeUp/useDbBackedRequest";
import { fetchHealthStatus } from "./health";

type HealthState =
  | { status: "loading" }
  | { status: "ready"; ok: boolean }
  | { status: "error" };

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

export default function App() {
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading"
  });
  const [topicForm, setTopicForm] = useState<TopicFormValues>(
    defaultTopicFormValues
  );
  const [fieldErrors, setFieldErrors] = useState<TopicFieldErrors>({});
  const [topicCreationState, setTopicCreationState] = useState<
    DbBackedRequestState<CreateTopicResponse>
  >({ status: "idle" });
  const lastSubmittedRequest = useRef<CreateTopicRequest | null>(null);

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

  const isSubmitting =
    topicCreationState.status === "loading" ||
    topicCreationState.status === "waking";
  const createdTopic =
    topicCreationState.status === "success"
      ? topicCreationState.data.topic
      : null;

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
    } catch (error) {
      setTopicCreationState({ status: "error", error });
    }
  }

  return (
    <main className="app-shell">
      <section className="product-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">R1 Manual Evidence-Backed Dossier</p>
            <h1 className="headline">Signal Tracker</h1>
          </div>
          <p className="lede">
            Create a topic dossier with a clear framing question, scope, and
            review cadence before adding evidence-backed timeline work.
          </p>
        </header>

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

        <section className="topic-workspace">
          <form
            className="topic-form"
            aria-labelledby="topic-form-title"
            onSubmit={(event) => void handleTopicSubmit(event)}
          >
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
                onChange={(event) =>
                  updateField("scopeNote", event.target.value)
                }
              />
            </label>

            <label className="form-field" htmlFor="topic-review-cadence">
              <span>Review cadence</span>
              <select
                id="topic-review-cadence"
                name="reviewCadence"
                value={topicForm.reviewCadence}
                onChange={(event) =>
                  updateField(
                    "reviewCadence",
                    event.target.value as ReviewCadence
                  )
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

          <CreatedTopicSummary topic={createdTopic} />
        </section>
      </section>
    </main>
  );
}

function CreatedTopicSummary({ topic }: { topic: Topic | null }) {
  if (!topic) {
    return (
      <aside className="topic-summary topic-summary--empty">
        <p className="eyebrow">Created topic</p>
        <h2>No topic created yet</h2>
        <p>
          Submit the form to create the top-level dossier container for future
          events, assessments, review notes, and citations.
        </p>
      </aside>
    );
  }

  return (
    <aside className="topic-summary" aria-live="polite">
      <p className="eyebrow">Created topic</p>
      <h2>{topic.title}</h2>
      <dl>
        <div>
          <dt>Framing question</dt>
          <dd>{topic.framingQuestion}</dd>
        </div>
        {topic.scopeNote ? (
          <div>
            <dt>Scope note</dt>
            <dd>{topic.scopeNote}</dd>
          </div>
        ) : null}
        <div>
          <dt>Review cadence</dt>
          <dd>{formatReviewCadence(topic.reviewCadence)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{topic.status}</dd>
        </div>
        <div>
          <dt>Topic ID</dt>
          <dd>{topic.id}</dd>
        </div>
      </dl>
    </aside>
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

function formatReviewCadence(reviewCadence: ReviewCadence): string {
  return (
    reviewCadenceOptions.find((option) => option.value === reviewCadence)
      ?.label ?? reviewCadence
  );
}
