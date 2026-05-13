# AGENTS.md - signal-tracker-web API layer

Also follow `../../AGENTS.md` for Signal Tracker web data/state conventions.

## RTK Query Cache Invalidation

- Mutations should invalidate cache tags only after successful server work unless a failed mutation intentionally needs to refresh active queries. Use `invalidateTagsOnSuccess` from `@repo/ui-base/rtk-query` for mutation `invalidatesTags` callbacks so scoped action failures do not turn into page-level query failures.

## RTK Query Notification Options

- `getQuery` and `getMutation` from `@repo/ui-base/rtk-query` require notification options at wrapper creation time. Use them for API-level success messages, error titles, rare user-facing error-message overrides, or `displayError: false` when a caller intentionally renders the API error elsewhere.
- Pass an empty object only when the hook should use the default API error message, should not add a custom error title, should not emit a success notification, and should not suppress default error display.
- Keep notification behavior attached to the exported hook, not passed dynamically from component call sites. When the same endpoint is used at multiple UI levels with different notification needs, export separate hooks for that endpoint with different `getQuery` or `getMutation` options so each hook has a stable, reviewable notification contract.
- Default API error notifications render through the nearest notification provider that accepts their type. If a hook is used for a form-local action, make sure the hook is called below the relevant form/provider boundary instead of adding local parsing or forwarding code.
- Configure success notifications on mutation hooks when the completed action should produce user feedback. Success messages normally pass through form-local error providers and display in the root flashbar.
- Use `displayError: false` only for hooks whose failures are already rendered by a dedicated page/section state, intentionally hidden by default, or otherwise not suitable for automatic notification display.
- Keep endpoint definitions, Signal Tracker route binding, cache tag names, and notification copy in this app. Put reusable RTK mechanics in `@repo/ui-base/rtk-query`.
