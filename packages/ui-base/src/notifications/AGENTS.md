# AGENTS.md - @repo/ui-base/notifications

Also follow `../../AGENTS.md` for the package-wide behavior-only boundary.

## Scope

- Own notification behavior only: providers, context, hooks, action/message
  types, input normalization, nearest-provider clearing, dismissal, and
  unsupported-message escalation.
- Keep this subpath style-free. Do not import Tailwind classes, dashboard
  components, icons, flashbars, alerts, or other visual renderers.
- Keep user-facing notification copy in the app or API wrapper caller. Shared
  notification behavior should carry message data and routing policy, not
  product wording.
- Preserve nested-provider semantics: local providers handle supported message
  types, unsupported message types pass upward, and clear-on-submit behavior
  applies only to the nearest provider.

## Tests

- Add focused tests for provider boundaries, escalation, single-versus-multiple
  state, dismissal, and nearest-provider clearing when those contracts change.
