# @repo/api-contracts

Shared HTTP/API contract helpers for sandbox apps.

Current exports include:

- `apiErrorSchema`
- `getApiErrorMessage`
- `isApiErrorCode`
- generic route-contract request and response helpers

This package is intentionally transport-agnostic. It can build a small
structural request object from route contracts and parse responses through
schemas, but it does not import RTK Query, Redux, UI packages, or app-specific
route registries.
