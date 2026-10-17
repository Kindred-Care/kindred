# API contract and client generation

The ASP.NET Core OpenAPI specification is the only source of API types (Section 3, Refinement 2;
ADR 0014). Nothing in the client is written by hand.

## How the loop works

1. `dotnet build backend/Kindred.Api` writes [`openapi.json`](openapi.json) here (OpenAPI 3.1). It is
   committed so every contract change is visible in the pull request.
2. `npm --prefix scripts/codegen run api` runs openapi-typescript and writes
   `apps/mobile/src/api/generated/schema.ts`. Never edit that folder.
3. `apps/mobile/src/api/client.ts` wraps the generated types with `openapi-fetch`.

`npm run codegen` at the repository root does all of it, plus the design tokens.

## What CI enforces (job `contract`)

- It rebuilds the specification and the client and fails if either differs from what is committed.
  Fix: run `npm run codegen` and commit the result.
- It compares the specification with the base branch using oasdiff and fails on a breaking change
  (removed operation or property, narrowed type, new required input). If the break is intended, version
  the route (`/v2/...`) or add the label `contract:breaking-approved` and explain why in the pull request.

## Conventions

- Every route starts with `/v1/`.
- Every operation has an `operationId` (the `Name` on the HTTP attribute).
- Enums travel as camelCase strings.
- Errors are `application/problem+json` with `type`, `title`, `status` and `correlationId`.
- Responses use explicit contract records, never database entities.
