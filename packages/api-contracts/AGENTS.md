# AGENTS.md - @repo/api-contracts

Also follow the repo root `AGENTS.md` for shared-package boundaries, testing,
and dependency direction.

## Scope

- Keep this package focused on HTTP/API contract primitives that are useful
  across app families.
- Do not import UI packages, RTK Query, Redux, app packages, or visual
  notification code.
- Route-contract helpers may know about route specs and Zod schemas, but not
  about a specific transport client.
- Keep domain-specific route names, schemas, and error-code unions in the
  consuming app or project-scoped shared package.
