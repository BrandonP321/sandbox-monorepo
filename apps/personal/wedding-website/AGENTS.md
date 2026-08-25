# AGENTS.md — Wedding Website

## Scope

- This project is a wedding website. The current RSVP milestone uses an **open
  self-entry guest flow**; it does not resolve guests against pre-seeded
  household records before showing the form.
- Read the root `AGENTS.md` and follow the repository's shared-code conventions
  before changing this project.
- Canonical RSVP/data policy lives in
  [02_RSVP_GUEST_ACCESS_AND_DATA_DESIGN](https://docs.google.com/document/d/19TJ0zcKDXHnE9Gd_MmDfeobsC9PKiZeOHwtVJ-r_1B4/edit).
- Canonical frontend implementation context lives in the
  [frontend prototype and Codex handoff](https://docs.google.com/document/d/1BXn-lBbuD5DzEX_Ygy6GLWTzRtTS4bCFKLlHEduqvFo/edit)
  and the
  [continuity tracker](https://docs.google.com/document/d/1WC4r9dEEFcd0OynZLyRYlo2-up_iP6qeKkuCpLjhGdM/edit).

## Current RSVP Product Model

- The guest starts by choosing **Niamh's side** or **Brandon's side**. This is
  organizational metadata only; the invitations/RSVP cards were not different
  by side. Copy must not imply otherwise.
- The respondent manually enters their own name and may add/remove additional
  adults covered by the invitation.
- Each adult independently chooses `Attending`, `Not sure yet`, or
  `Unable to attend`.
- Each adult may optionally provide an email address and phone number. At least
  one email address or phone number must be present across the adults in the
  party before continuing. Show the group-level contact Alert above Continue,
  but do not move focus away from Continue when that is the only error.
- There is no separate plus-one eligibility model. An invited guest/plus-one is
  another manually entered adult.
- Children are one party-level `children attending` count; individual child
  names are not required in the initial launch.
- Show party-level email and phone again on the additional-details step,
  prefilled independently from the first adult email and first adult phone when
  those party-level fields are blank. Guests may edit the prefilled values, but
  at least one party-level contact method remains required. Neither contact
  location is verified or used as guest authentication. Show its missing-contact
  Alert immediately below the contact fields and keep focusing the email field
  when the user tries to continue without either contact method.
- Format phone values while the guest types, using US national formatting by
  default while continuing to support international numbers entered with `+`.
- Dietary/allergy, accessibility/accommodation, and general-note fields are
  optional party-level text.
- Treat every eventual public submission as a new record. Do not automatically
  deduplicate or overwrite based on name, email, phone, or side.
- There is no public lookup / View/Edit RSVP path after submission. If plans
  change, guests may submit another RSVP or contact Brandon/Niamh.
- Do not put canonical household IDs or canonical guest-list data in the
  guest-facing draft. A future protected admin page may map raw submissions to
  canonical household data; that work is explicitly deferred.

## Visual Sources of Truth

- RSVP Front and RSVP back control illustration and artistic style.
- The refined RSVP-flow image controls page layout and composition only.
- Generated website mockups must not redefine the RSVP doodle style.
- Exact font-family names are intentionally deferred. Use semantic font tokens
  so temporary families remain replaceable.
- Runtime asset paths, dimensions, and optimization status live in
  `ASSET_INVENTORY.md`. Keep Drive-based design references outside the runtime
  asset tree, and preserve inventory paths when optimized PNGs replace source
  exports in place.

## Frontend Foundation

- Central design tokens live in `wedding-website-web/src/styles/tokens.css`.
  Use the semantic color, spacing, width, radius, motion, and font variables
  instead of repeating literal values in components.
- Keep wedding-specific visual primitives app-local under
  `wedding-website-web/src/components/ui`. Promote a primitive only after a
  second non-dashboard design system demonstrates the same stable contract.
- Keep decorative content inside the `DecorativeLayer` convention so it stays
  hidden from assistive technology, ignores pointer input, and can reflow or
  disappear independently of functional content.
- Use the shared motion-duration tokens for any future transitions and provide
  an equivalent static experience under `prefers-reduced-motion`.
- The current foundation is plain CSS. Do not add Tailwind or another styling
  system without a concrete later issue that justifies the dependency.

## RSVP State and Persistence Guardrails

- Remove/avoid runtime fixture selection, `FixtureId`, selected-household state,
  prebuilt invitees, and plus-one eligibility in the guest flow.
- Local/client IDs for dynamic adult rows are UI-state identifiers only; they
  are not production guest/person IDs or credentials.
- localStorage may be used for versioned draft/session convenience in the
  frontend prototype. It must not be used as authentication or as a model for
  production RSVP lookup/editing.
- Schema-incompatible fixture-era localStorage should fail safely to a clean
  self-entry draft rather than being migrated into fake household identity.

## Security, Data, and Deployment Guardrails

- Build functional UI with real, accessible HTML and CSS controls. Keep
  decorative artwork separate from form semantics and interaction.
- Use synthetic data only in tests/developer helpers. Never put real guest PII
  in source code.
- Do not add guest phone lookup, OTP, household access links, passwords, guest
  accounts, or hidden contact-based record retrieval unless a later approved
  decision explicitly changes the open self-entry model.
- Static hosting/pipeline work may exist under Issue #78. The protected preview
  hostname is `wedding.bphillips.dev`; **do not deploy or configure
  `niamhandbrandon.com`** until a later explicit launch decision.
- The temporary preview gate is site-wide development protection, not guest RSVP
  authentication and not the long-term guest-access model.
- Do not add backend/API/database/admin/email/SMS capabilities unless a later
  issue explicitly scopes them.
- Keep the future production submission API replaceable. The current direction
  is create-submission semantics, not public household lookup/update.
- Do not import dashboard-oriented UI packages for convenience when their
  visual language conflicts with the wedding direction.
