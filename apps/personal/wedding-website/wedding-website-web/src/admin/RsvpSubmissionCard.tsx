import type { AdminRsvpSubmission } from "@repo/wedding-website-shared";

function RsvpSubmissionCard({
  submission
}: {
  submission: AdminRsvpSubmission;
}) {
  return (
    <article className="admin-rsvp-card">
      <header className="admin-rsvp-card__header">
        <div>
          <h3>{sideLabel(submission.guestSide)}</h3>
          <time dateTime={submission.submittedAt}>
            {formatSubmittedAt(submission.submittedAt)}
          </time>
        </div>
        <p className="admin-rsvp-card__id">
          Submission ID: {submission.submissionId}
        </p>
      </header>

      <section aria-label="Adults" className="admin-rsvp-card__section">
        <h4>Adults</h4>
        <div className="admin-adult-list">
          {submission.adults.map((adult, index) => (
            <div
              className="admin-adult"
              key={`${submission.submissionId}-adult-${index}`}
            >
              <h5>{adult.name}</h5>
              <dl className="admin-detail-list">
                <Detail
                  label="Attendance"
                  value={attendanceLabel(adult.attendance)}
                />
                <Detail label="Email" value={adult.contact.email} />
                <Detail label="Phone" value={adult.contact.phone} />
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Party details" className="admin-rsvp-card__section">
        <h4>Party details</h4>
        <dl className="admin-detail-list">
          <Detail
            label="Children attending"
            value={String(submission.childrenAttending)}
          />
          <Detail label="Party email" value={submission.contact.email} />
          <Detail label="Party phone" value={submission.contact.phone} />
          <Detail
            label="Dietary / allergy notes"
            value={submission.dietaryOrAllergyNotes}
          />
          <Detail
            label="Accessibility / accommodation notes"
            value={submission.accessibilityNotes}
          />
          <Detail label="General note" value={submission.generalNote} />
        </dl>
      </section>
    </article>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (value === undefined) {
    return null;
  }
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function sideLabel(side: AdminRsvpSubmission["guestSide"]): string {
  return side === "niamh" ? "Niamh's side" : "Brandon's side";
}

function attendanceLabel(
  attendance: AdminRsvpSubmission["adults"][number]["attendance"]
): string {
  switch (attendance) {
    case "attending":
      return "Attending";
    case "not-sure":
      return "Not sure yet";
    case "unable":
      return "Unable to attend";
  }
}

function formatSubmittedAt(submittedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(submittedAt));
}

export { RsvpSubmissionCard };
