# Timelines

- Keep the visual system app-owned. Do not import `@repo/dashboard-ui`, its theme,
  or copied Signal Tracker layouts. Reuse shared configuration and suitable
  behavior-only helpers from `@repo/ui-base`.
- Preserve source identity in live compositions; deduplicate repeated sources and
  prevent cycles. Removing an inclusion must not remove source entries.
- Distinguish periods from uncertain occurrences, and retain BCE/CE and date
  precision in labels. Never silently convert historical dates through time zones.
- Give phone users a chronological list and preserve natural vertical scrolling.
  Date changes use explicit fields, never dragging timeline marks.
- Prototype fixtures and in-memory changes are not production persistence,
  authorization, or accepted product direction. Record owner review separately.
