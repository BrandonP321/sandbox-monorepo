# WORKFLOW.md — Standard Development Loop

This repo is optimized for an "AI-led" workflow:
- ChatGPT Project = requirements + domain context + research + task briefs
- Codex = repo-native implementation (edits + commands + tests)
- Human = review + decisions + final approval

## Quality Bar (personal apps, but reliable)
- Every behavior change gets at least one test.
- Prefer unit tests for pure logic; add an integration test for critical flows.

## Decision Rules
- If you’re about to add app-local helpers that could be reused, stop and consult SHARED_CODE_PLAYBOOK.md.
- If requirements are ambiguous, state assumptions and proceed with the smallest reasonable interpretation.
