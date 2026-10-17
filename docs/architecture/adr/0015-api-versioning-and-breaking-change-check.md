# 0015. URL versioning and an oasdiff breaking-change check

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3 Refinement 2 (items 4 and 5), Section 10 criterion 12

## Decision

- Every route starts with `/v1/`. An architecture test fails if a controller route does not.
- Versioning is by route prefix; a new version is a new prefix when a breaking change is unavoidable.
  A versioning library (Asp.Versioning) is adopted only when a second version is first needed.
- CI job `contract`, on every pull request, compares the base branch's `docs/api/openapi.json` with the
  pull request's using **oasdiff 1.33.0** (`oasdiff breaking --fail-on ERR`), downloaded with a pinned
  SHA-256 checksum. A breaking change fails the check unless the pull request carries the label
  `contract:breaking-approved` and states the reason; the change is then still reported as a warning.

## Consequences

Removing an operation, removing a response property, narrowing a type or adding a required request
field is flagged before it can reach an app that depends on it.
