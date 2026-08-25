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
- Configure the production hostname only when the app is intended to receive
  traffic. Do not add a separate preview password, Basic Auth gate, or similar
  site-wide access restriction unless the user explicitly requests one.
- Do not import dashboard-oriented UI packages for convenience when their
  visual language conflicts with the wedding direction.
