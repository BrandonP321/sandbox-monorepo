function TopicDossiersDetail() {
  return (
    <>
      <h4>What the feature does</h4>
      <p>
        Signal Tracker starts with a topic dossier. A topic is the main
        workspace for an issue the user wants to track over time, such as a
        policy debate, geopolitical development, legal dispute, institutional
        change, or public-affairs question.
      </p>
      <p>
        Each topic is more structured than a folder or note. It can include a
        title, framing question, scope note, status, tags, and review cadence.
        That structure gives the user a clear boundary for what the topic is
        about and what kind of continuity they are trying to preserve.
      </p>
      <h4>Why it matters</h4>
      <p>
        Many long-running issues become hard to track because the user loses the
        original frame. The same topic can expand across news cycles, documents,
        arguments, and assessments until it becomes a loose pile of notes.
      </p>
      <p>
        The dossier model prevents that by asking the user to define the issue
        up front. The framing question clarifies what the user is trying to
        understand. The scope note prevents drift. The review cadence gives the
        topic a revisit rhythm rather than letting it disappear after public
        attention moves on.
      </p>
      <h4>User experience</h4>
      <p>
        A user can create a topic, see active topics, open a topic detail page,
        and manage the topic over time. Archive is the safe non-destructive
        lifecycle action for removing a topic from active views. Delete is
        treated as an intentionally destructive action.
      </p>
      <p>
        The portfolio modal should describe this as the product&apos;s
        organizing layer: every entry, source, assessment, and review exists
        inside a defined analytical workspace.
      </p>
      <h4>What to emphasize</h4>
      <p>
        This feature shows that Signal Tracker is not a generic note-taking app.
        The product starts from a specific analytical object: a tracked issue
        with a question, scope, status, and review workflow.
      </p>
      <p>
        The key portfolio message is that the app is designed around continuity.
        It helps the user return to a topic later and understand what they were
        tracking, why it mattered, and where the boundaries were.
      </p>
    </>
  );
}

function EvidenceBackedEntriesDetail() {
  return (
    <>
      <h4>What the feature does</h4>
      <p>
        Signal Tracker uses entries as the core timeline objects inside a topic.
        The MVP supports three user-facing entry modes: Event, Assessment
        Update, and Review Note.
      </p>
      <p>
        An Event captures what happened. An Assessment Update captures what the
        user currently thinks and why. A Review Note captures what the user
        concluded while revisiting a topic.
      </p>
      <p>
        Entries can include dates, descriptions, epistemic labels, tags, source
        URLs, and citations. This gives the timeline more structure than a
        chronological note stream.
      </p>
      <h4>Source capture</h4>
      <p>
        A key feature is entry-centered source attachment. The user can paste
        source URLs while creating or updating an entry instead of maintaining a
        separate evidence library as the default workflow.
      </p>
      <p>
        From the user&apos;s perspective, saving the entry attaches the relevant
        sources. Internally, the system can preserve normalized source,
        evidence, and citation records for traceability.
      </p>
      <p>
        This design keeps source capture fast while still allowing a more
        durable evidence model underneath.
      </p>
      <h4>Evidence quality</h4>
      <p>
        Signal Tracker is designed to show whether an entry has source support.
        Entries can expose source indicators, attached source summaries, and
        uncited states.
      </p>
      <p>
        The system can also support citation relationships such as whether a
        source supports, contradicts, contextualizes, or is simply the source
        for an entry. Where more precision is needed, the evidence model can
        support quote, page, or snippet-level anchors rather than relying only
        on raw URLs.
      </p>
      <h4>What to emphasize</h4>
      <p>
        This is one of the strongest user-facing features. It communicates that
        Signal Tracker is not just a place to write claims. It preserves the
        evidence trail behind those claims.
      </p>
      <p>
        The key portfolio message is that source capture is built into the
        normal writing flow. The user can add what happened, attach evidence,
        and preserve citation context without switching into a separate
        evidence-management workflow.
      </p>
    </>
  );
}

function LivingAssessmentsDetail() {
  return (
    <>
      <h4>What the feature does</h4>
      <p>
        Signal Tracker lets the user maintain a current assessment for a topic
        while preserving assessment history over time.
      </p>
      <p>
        An assessment update can include a judgment, confidence level, optional
        probability, assumptions, indicators to watch, resolution criteria,
        target resolution date, and source support. The current assessment can
        be derived from the latest active assessment update rather than stored
        as a separate disconnected object.
      </p>
      <h4>Why it matters</h4>
      <p>
        A major product problem Signal Tracker addresses is that people often
        forget what they believed at the time and why. They may remember the
        latest conclusion, but not the assumptions, confidence level, or
        evidence that produced it.
      </p>
      <p>
        Living assessments make the user&apos;s reasoning explicit. They help
        the user see not only what changed in the world, but what changed in
        their own judgment.
      </p>
      <h4>Assessment history</h4>
      <p>
        Prior assessments are preserved instead of silently overwritten. This
        matters because changing your mind is part of analysis. The product
        should make it possible to reconstruct how a view evolved over time.
      </p>
      <p>
        The current assessment gives the user quick orientation when opening a
        topic. The assessment history provides the deeper record for
        understanding how confidence, assumptions, and indicators moved.
      </p>
      <h4>What to emphasize</h4>
      <p>
        This feature makes Signal Tracker feel analytical rather than merely
        archival. It is not just a timeline of facts; it is a judgment record.
      </p>
      <p>
        The key portfolio message is that the app supports disciplined thinking
        under uncertainty. It makes confidence, assumptions, indicators, and
        evolving judgments visible instead of leaving them implicit.
      </p>
    </>
  );
}

function ReviewProvenanceWorkflowDetail() {
  return (
    <>
      <h4>What the feature does</h4>
      <p>
        Signal Tracker is designed for returning to a topic after time away. The
        review workflow helps the user quickly recover what changed without
        rereading the entire historical record.
      </p>
      <p>
        The topic page can surface the current assessment, recent timeline
        activity, source indicators, open indicators, and a since-last-review
        view. The user can filter to new material, write a review note, update
        the assessment, and mark the review complete.
      </p>
      <h4>Since-last-review workflow</h4>
      <p>
        The since-last-review feature is intentionally deterministic. It does
        not require AI summaries to tell the user what changed. Instead, it uses
        the topic&apos;s review baseline and timeline records to help the user
        inspect new material directly.
      </p>
      <p>
        This supports the product&apos;s core principle: review loops over
        engagement loops. The app rewards periodic synthesis rather than
        constant monitoring.
      </p>
      <h4>Provenance and lifecycle</h4>
      <p>
        Signal Tracker also preserves analytical provenance. Entries can support
        revision history so prior wording and judgments are not accidentally
        lost. Entries can be archived or soft-deleted where recovery or
        traceability matters.
      </p>
      <p>
        Topic lifecycle is intentionally different. Archive is the reversible
        action for hiding a topic from the active workspace. Topic delete is
        treated as a permanent destructive action and should require clear
        confirmation.
      </p>
      <h4>Export and control</h4>
      <p>
        The product direction includes exporting topic data to formats such as
        JSON, CSV, or a simple dossier-style brief. Export matters because the
        user should not be locked into the app. A topic record should remain
        inspectable and portable outside the product.
      </p>
      <h4>What to emphasize</h4>
      <p>
        This feature group captures the continuity promise of Signal Tracker.
        The app is built for users who need to return to a complex issue later
        and understand what changed, what they thought, what evidence existed,
        and what still needs attention.
      </p>
      <p>
        The key portfolio message is that Signal Tracker preserves a durable
        analytical record. It is not optimized for endless intake; it is
        optimized for recovery, review, and accountable judgment over time.
      </p>
    </>
  );
}

export {
  EvidenceBackedEntriesDetail,
  LivingAssessmentsDetail,
  ReviewProvenanceWorkflowDetail,
  TopicDossiersDetail
};
