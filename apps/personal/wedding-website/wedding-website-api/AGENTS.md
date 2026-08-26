# AGENTS.md — Wedding Website API

Also follow `../AGENTS.md` and
`../PRODUCTION_RSVP_ARCHITECTURE.md`.

- Expose only the create-only public RSVP operation unless a later approved
  issue changes the architecture.
- Keep persistence behind the atomic repository boundary and keep guest PII,
  request bodies, attempt keys, hashes, and raw exceptions out of logs.
- Keep local development on the in-memory repository. The production Lambda
  must explicitly inject the DynamoDB repository through `RSVP_TABLE_NAME` and
  must fail closed rather than falling back to process-local persistence.
