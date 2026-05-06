# AGENTS.md - signal-tracker-web API layer

Also follow `../../AGENTS.md` for Signal Tracker web data/state conventions.

## RTK Query Cache Invalidation

- Mutations should invalidate cache tags only after successful server work unless a failed mutation intentionally needs to refresh active queries. Use `invalidateTagsOnSuccess` for mutation `invalidatesTags` callbacks so scoped action failures do not turn into page-level query failures.
