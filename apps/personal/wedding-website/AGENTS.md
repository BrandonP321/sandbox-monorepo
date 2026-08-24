# AGENTS.md — Wedding Website

## Scope

- This project is a wedding website. The current milestone is a frontend-only,
  fictional RSVP prototype targeted for August 26, 2026; that date is not a
  production-readiness commitment.
- Read the root `AGENTS.md` and follow the repository's shared-code conventions
  before changing this project.
- Canonical implementation context lives in the
  [frontend prototype and Codex handoff](https://docs.google.com/document/d/1BXn-lBbuD5DzEX_Ygy6GLWTzRtTS4bCFKLlHEduqvFo/edit)
  and the
  [continuity tracker](https://docs.google.com/document/d/1WC4r9dEEFcd0OynZLyRYlo2-up_iP6qeKkuCpLjhGdM/edit).

## Visual Sources of Truth

- RSVP Front and RSVP back control illustration and artistic style.
- The refined RSVP-flow image controls page layout and composition only.
- Generated website mockups must not redefine the RSVP doodle style.
- Exact font-family names are intentionally deferred. Use semantic font tokens
  so temporary families remain replaceable.

## Prototype Guardrails

- Build functional UI with real, accessible HTML and CSS controls. Keep
  decorative artwork separate from form semantics and interaction.
- Use fictional fixtures only when RSVP work begins. Never put real guest PII in
  source code.
- Do not add a backend, API, database, authentication, real access tokens,
  admin tools, email, SMS, deployment, or production services unless a later
  issue explicitly expands the milestone.
- Keep production architecture replaceable. Do not couple the frontend to an
  assumed backend contract prematurely.
- Do not import dashboard-oriented UI packages for convenience when their
  visual language conflicts with the wedding direction.
