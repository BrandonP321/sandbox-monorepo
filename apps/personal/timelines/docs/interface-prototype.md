# Interface prototype and owner review

Related: [#103 interface proof](https://github.com/BrandonP321/sandbox-monorepo/issues/103),
[#100 approved product scope](https://github.com/BrandonP321/sandbox-monorepo/issues/100).

## Review status

**Proposed direction; owner acceptance pending.** The local prototype was
presented for review on September 26, 2026. There is no recorded owner usability
feedback or acceptance yet. Do not treat this document, automated checks, or the
associated implementation as acceptance for dependent UI issues #107–#110.
Record the owner's feedback and resulting decisions here before changing that status.

Review locally with the [prototype instructions](../timelines-web/README.md).
The primary questions are whether date buckets are intuitive enough, whether
source editing impact is clear, and whether the phone list/editor meets the
owner's study workflow. The prototype deliberately leaves production contracts,
auth, persistence, real sharing, deployment, and permanent history to later issues.

## Proposed visual direction

A quiet study workspace with warm paper, serif headings, olive controls, and
explicit source labels. Styling and layout are owned by this app. No dashboard
theme, copied dashboard layout, styled shared package, charting library, font
download, or decorative dependency is used. React/Vite and shared lint, TypeScript,
and test configuration reuse the repository's existing versions.

| Token             | Value / role                                                 |
| ----------------- | ------------------------------------------------------------ |
| Paper             | `#f5f4ee` page, `#fffef9` content                            |
| Sidebar           | `#ebeee4`                                                    |
| Ink / muted       | `#283b30` / `#53614f`                                        |
| Primary action    | `#314e38` with near-white text                               |
| Dividers          | `#d9ded0`                                                    |
| Keyboard focus    | 3px `#a65b20` outline, 3px offset                            |
| Source identity   | Number + name + colored line/square                          |
| Type identity     | Text label + colored dot; independent of source identity     |
| Typography        | Local Avenir/Segoe UI stack; Iowan/Palatino/Georgia headings |
| Spacing / corners | 4px-based spacing; 6–8px controls and surfaces               |
| Phone breakpoint  | 760px; chronological list by default                         |

The horizontal view uses seven labeled date buckets per source. Grouping bounds
rendering and prevents label collisions. A group opens a paginated chronological
list; every entry retains its explicit date, source, and type. Periods and uncertain
occurrences use different labels/glyphs, with dashed notation for uncertain dates.
Before/after entries can overlap the viewport even when their bound is offscreen.
The card shows that bound rather than implying an exact occurrence in the bucket.
High zoom uses month/day tick labels, without a displayed year zero.

This is a **bucketed navigation proof**, not a final proportional-duration renderer.
Cards represent date groups; card width does not encode an event's duration or
confidence interval. This tradeoff is a specific owner-review question. Production
date contracts and uncertainty semantics still belong to #104.

## Component and state boundaries

| Boundary                                     | Responsibility                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `App`                                        | Selected timeline, owner/shared mode, panel orchestration                   |
| `useWorkspace`                               | Disposable fixture state, exact entry changes, revision conflicts/undo      |
| `Explorer`                                   | Search, types, viewport, list/timeline mode, loading/empty/error states     |
| `TimelineCanvas` / `timelineLayout`          | Bounded source buckets; mouse, wheel, keyboard navigation                   |
| `TimelineToolbar`                            | Explicit pan/zoom, fit, BCE/CE jump                                         |
| `EntryList`                                  | Semantic list, 50-row increments, entry selection                           |
| `EntryDetail` / `EntryEditor` / `DateFields` | Source impact, fallback images, explicit precision-aware editing            |
| `LibraryPanels`                              | Source composition, global type management, explicit share source selection |
| `ReviewPanel`                                | Exact before/after proposal, named batch, session recovery                  |
| `Sheet`                                      | App-owned sheet styling around native modal dialog behavior                 |
| `model` / `dates` / `fixtures`               | Prototype-only data, graph traversal, dates and synthetic examples          |

Repeated source IDs resolve once, including when reached both directly and
recursively. Cycle-producing source inclusions are disabled. Entries are edited
in their source; inclusions are references and never copied entries. Removing an
inclusion preserves source content. Types keep stable IDs when renamed.

Shared preview computes entries from an explicit source allowlist before applying
presentation filters. It removes owner navigation, inventories, editor actions,
and revision/proposal surfaces. New inclusions do not expand the allowlist. This
is an interface simulation: all synthetic data is still bundled in the browser,
so it is not an authorization boundary or an anonymous-access security proof.

## Accessibility and navigation decisions

- Semantic buttons, labels, fieldsets, lists, named dialogs, visible text and focus.
  Source/type meaning never depends only on color. A skip link reaches the explorer.
- Native modal dialogs provide inert background content, keyboard cycling, Escape
  dismissal, and focus return. No custom focus trap or global keyboard shortcuts.
- Arrow keys pan only while the timeline surface itself has focus, preserving
  normal form, button, and select behavior. Explicit zoom/pan controls remain available.
- Mouse dragging the ruler pans; entry dragging never changes dates. Horizontal
  wheel/trackpad input pans the dates when the board fits, or naturally scrolls
  an overflowing board. Vertical wheel/touch input retains page scrolling.
- Phone mode defaults to the list on mount. Touch can scroll the horizontal board
  without preventing vertical page movement. Sheets use `100dvh` and native scrolling.
- Buttons have at least 44px height; compact zoom controls have 44px width.
  Checkbox labels provide larger click/touch areas. Phone editor inputs use 16px text.
- Reduced-motion preference removes transitions. Images have alt/caption fields
  and an explicit unavailable state; no external image is required to use the prototype.

## Fixtures and performance targets

The study fixture contains **46 entries across six timelines** (41 entries in the
initial composite), four reusable types, a repeated nested source, 24 same-day
entries, periods, uncertain ranges, circa/before/after notation, BCE/CE examples,
and one deliberately broken image URL. The long view spans 3200 BCE–2020 CE;
one timeline is empty. Loading/error controls are explicit simulations.

The scale fixture contains **10,000 entries across 20 sources**, plus a composition
root. One source is reachable twice. Seven buckets per source bound the timeline
to at most 140 entry-group buttons; the list initially renders 50 entries and can
expand in 50-entry increments. These fixture sizes are engineering targets, not
product quotas. Further list expansion is not virtualized.

| Target                            | Desktop                    | Phone simulation            |
| --------------------------------- | -------------------------- | --------------------------- |
| Warm filter / pan / zoom response | <100ms                     | <200ms at 4× CPU throttle   |
| Switch to 10,000-entry fixture    | <500ms                     | <1,000ms at 4× CPU throttle |
| Initial visible list rows         | 50                         | 50                          |
| Timeline group buttons            | At most 140 for 20 sources | Same                        |
| Initial assets, gzip              | JS <200KB; CSS <25KB       | Same                        |

September 26 measurements: production Vite preview, macOS 26.5.2 arm64,
Chromium 153.0.8010.53, 1440×1000 desktop and 390×844 phone viewport. Phone uses
Chrome DevTools 4× CPU throttling. Response is measured inside the page from a
button click through two animation frames. Five warm samples per operation are
reported as the maximum, not a population percentile. No network/backend is involved.

| Observed operation                   | Desktop        | Phone simulation   |
| ------------------------------------ | -------------- | ------------------ |
| Switch to scale fixture              | 41.5ms         | 110.9ms            |
| Zoom, largest of five samples        | 16.7ms         | 52.4ms             |
| Type filter, largest of five samples | 16.6ms         | 60.4ms             |
| Initial scale list rows              | —              | 50                 |
| Rendered scale groups                | 110 initially  | 75 after filtering |
| Gzipped production JS / CSS          | <73KB / <5.2KB | Same               |

These are local observations, not real-device latency or production guarantees.
Physical iPhone/Android, Safari/VoiceOver/TalkBack, network loading, production
authorization, and durable recovery remain unverified.

## Validation and review evidence

- Eleven unit/integration checks cover BCE/CE and precision, invalid dates,
  interval overlap, deduplication/cycles, conflicting undo, 10,000-entry grouping,
  pan/zoom/jump/list navigation, source edits and restore, nested inclusion,
  batch preview/apply/undo, type renaming, and read-only source exclusion.
- Real Chromium interaction checks exercised desktop wheel/ruler/keyboard pan,
  zoom/fit, entry editing, broken-image fallback, source-impact text, revision
  restore, exact batch application/undo, nested inclusion, and new-source exclusion
  from a share preview. Narrow browser checks exercised list/detail/edit/save,
  horizontal scrolling, and natural vertical page scrolling.
- Chromium touch emulation moved the board horizontally and the page vertically;
  native modal Tab cycling, Escape, and focus return were inspected. This does not
  replace testing on a physical phone or with assistive technology.
- Desktop and narrow phone layouts were visually inspected. The 320px layout at
  high zoom has no document overflow. Axe 4.11.1 reported zero WCAG A/AA violations
  in desktop, phone list, editor, type library, composition, and shared preview
  after correcting sidebar text contrast. Automated checks are a useful supplement,
  not a claim of full accessibility conformance.
- Root install, format check, lint, typecheck, tests, and build are the release
  checks. Installation succeeds; the existing `simple-git-hooks` prepare command
  reports that a linked worktree's `.git` is a file. Formatting is explicitly checked.

Local inspection captures are generated under `output/playwright/` (not source
assets): desktop, phone list, phone editor, high zoom at 320px, and performance
results. Reproduce with `pnpm --filter timelines-web build` followed by
`pnpm --filter timelines-web preview`, then inspect <http://127.0.0.1:4178>.

## Remaining acceptance work

- Record owner feedback on the actual prototype and resolve material usability issues.
- Link the accepted direction for dependent interface issues only after that review.
- Validate physical-phone and assistive-technology behavior before production acceptance.
