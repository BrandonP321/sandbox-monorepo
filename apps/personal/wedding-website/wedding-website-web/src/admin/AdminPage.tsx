import { useRef, useState, type FormEvent } from "react";

import type { AdminRsvpSubmission } from "@repo/wedding-website-shared";

import {
  Alert,
  Button,
  ContentFrame,
  FormField,
  TextInput
} from "../components/ui";
import { listAdminRsvps } from "./adminApi";
import { RsvpSubmissionCard } from "./RsvpSubmissionCard";

type AdminPageProps = {
  apiBaseUrl: string;
  fetcher?: typeof fetch;
};

type AdminViewState =
  | "idle"
  | "loading"
  | "success"
  | "unauthorized"
  | "unavailable";

function AdminPage({ apiBaseUrl, fetcher }: AdminPageProps) {
  const [accessKey, setAccessKey] = useState("");
  const [submissions, setSubmissions] = useState<AdminRsvpSubmission[]>([]);
  const [viewState, setViewState] = useState<AdminViewState>("idle");
  const activeRequest = useRef(0);

  async function loadSubmissions(key: string) {
    const requestId = ++activeRequest.current;
    setViewState("loading");
    const result = await listAdminRsvps({
      accessKey: key,
      apiBaseUrl,
      ...(fetcher === undefined ? {} : { fetcher })
    });

    if (requestId !== activeRequest.current) {
      return;
    }
    if (!result.ok) {
      setSubmissions([]);
      setViewState(result.kind);
      return;
    }

    setSubmissions(result.submissions);
    setViewState("success");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = accessKey.trim();
    if (!key) {
      setViewState("unauthorized");
      setSubmissions([]);
      return;
    }
    setAccessKey(key);
    void loadSubmissions(key);
  }

  function handleLogout() {
    activeRequest.current += 1;
    setAccessKey("");
    setSubmissions([]);
    setViewState("idle");
  }

  const isLoading = viewState === "loading";
  const isSignedIn = viewState === "success";

  return (
    <main className="admin-page">
      <ContentFrame width="hero">
        <header className="admin-page__header">
          <p className="admin-page__eyebrow">Wedding website</p>
          <h1>RSVP Admin</h1>
          <p>Protected, read-only access to submitted RSVPs.</p>
        </header>

        {!isSignedIn ? (
          <section
            aria-busy={isLoading}
            className="admin-access"
            aria-labelledby="admin-access-heading"
          >
            <h2 id="admin-access-heading">Admin access</h2>
            <form className="admin-access__form" onSubmit={handleSubmit}>
              <FormField label="Admin access key" required>
                {(controlProps) => (
                  <TextInput
                    {...controlProps}
                    autoComplete="current-password"
                    disabled={isLoading}
                    onChange={(event) =>
                      setAccessKey(event.currentTarget.value)
                    }
                    type="password"
                    value={accessKey}
                  />
                )}
              </FormField>
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Loading…" : "View RSVPs"}
              </Button>
            </form>

            {isLoading ? (
              <p
                aria-live="polite"
                className="admin-access__status"
                role="status"
              >
                Loading RSVPs…
              </p>
            ) : null}
            {viewState === "unauthorized" ? (
              <Alert title="Access denied">
                The admin access key is missing or incorrect.
              </Alert>
            ) : null}
            {viewState === "unavailable" ? (
              <Alert title="Unable to load RSVPs">
                The RSVP list is temporarily unavailable. Check your connection
                and try again.
              </Alert>
            ) : null}
          </section>
        ) : (
          <section
            aria-labelledby="admin-list-heading"
            className="admin-dashboard"
          >
            <div className="admin-dashboard__toolbar">
              <div>
                <h2 id="admin-list-heading">Submitted RSVPs</h2>
                <p>
                  {submissions.length}{" "}
                  {submissions.length === 1 ? "submission" : "submissions"}
                </p>
              </div>
              <div className="admin-dashboard__actions">
                <Button
                  disabled={isLoading}
                  onClick={() => void loadSubmissions(accessKey)}
                  variant="quiet"
                >
                  Refresh
                </Button>
                <Button onClick={handleLogout} variant="quiet">
                  Log out
                </Button>
              </div>
            </div>

            {submissions.length === 0 ? (
              <p className="admin-dashboard__empty">No RSVP submissions yet.</p>
            ) : (
              <div className="admin-rsvp-list">
                {submissions.map((submission) => (
                  <RsvpSubmissionCard
                    key={submission.submissionId}
                    submission={submission}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </ContentFrame>
    </main>
  );
}

export { AdminPage, type AdminPageProps };
