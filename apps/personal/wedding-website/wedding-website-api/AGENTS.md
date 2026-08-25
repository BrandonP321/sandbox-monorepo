# AGENTS.md — Wedding Website API

Also follow `../AGENTS.md` and
`../PRODUCTION_RSVP_ARCHITECTURE.md`.

- Expose only the create-only public RSVP operation unless a later approved
  issue changes the architecture.
- Keep persistence behind the atomic repository boundary and keep guest PII,
  request bodies, attempt keys, hashes, and raw exceptions out of logs.
- Do not add AWS persistence or infrastructure in this package until the
  dedicated follow-on issue.
