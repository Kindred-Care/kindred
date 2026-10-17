# 0014. openapi-typescript with openapi-fetch for the generated client

- Status: Accepted
- Date: 2026-10-17
- Source: Section 1 (generated client approved), Section 3 Refinement 2 ("the generator is chosen in
  Milestone 1")

## Context

The OpenAPI specification is the only source of API types. Section 3 names two candidates:
openapi-typescript with a fetch client, or Orval.

## Decision

**openapi-typescript 7.13 with openapi-fetch.**

- The ASP.NET Core build writes `docs/api/openapi.json` (OpenAPI 3.1) with
  `Microsoft.Extensions.ApiDescription.Server`. It is committed, so every contract change shows in pull
  requests.
- `scripts/codegen` runs openapi-typescript into `apps/mobile/src/api/generated/schema.ts`, which is
  marked generated, excluded from lint and never edited.
- `apps/mobile/src/api/client.ts` is the thin hand-written wrapper over `openapi-fetch`. Phase 2 adds
  the auth header, organization route, error mapping, idempotency keys and the query-key factory there.
- The generator lives in its own small package (`scripts/codegen`) because it pins TypeScript 5 while the
  app uses TypeScript 6.

Why not Orval: it generates query hooks and fetchers as code, which would put generated logic (and its
key structure) where Section 3 requires our own query-key factory with user, organization and workspace
scope. openapi-typescript generates types only, adds no runtime beyond the 6 kB fetch client, and works
unchanged for the future web app.

## Consequences

CI job `contract` rebuilds the specification and the client and fails if either differs from what is
committed (criterion 12).
