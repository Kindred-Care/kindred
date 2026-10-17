# 0005. Layered tenant isolation

- Status: Accepted (enforced from Phase 2; conventions installed in Milestone 1)
- Date: 2026-10-17
- Source: Section 1 (approved layered isolation), Section 2, Section 4 foundation and security model,
  Section 6a; decision 36

## Context

One cross-tenant leak is catastrophic. No single control may be trusted alone.

## Decision

Independent layers, each working without the others:

1. Organization in the route (`/v1/organizations/{orgId}/...`) and an active-membership check on every
   request.
2. One access evaluator: permission, then client scope, then field level, with consent, authority and
   record state.
3. EF Core global query filters on the organization.
4. `organization_id NOT NULL` and `UNIQUE (organization_id, id)` on every tenant table, and composite
   foreign keys between tenant tables, checked by an architecture test and a database catalog test.
5. PostgreSQL Row-Level Security with `FORCE ROW LEVEL SECURITY`, an organization set per transaction,
   and an API role without `BYPASSRLS`. RLS covers organization and draft author in V1; assignment scope
   stays in the application (decision 36).
6. A resource in another organization returns "not found".

## Consequences

- Milestone 1 installs the API role without `BYPASSRLS` and separate migration role (ADR 0019).
- Phase 2 (G1) and every later phase (G3) run the cross-organization and generated authorization
  matrix against real PostgreSQL.
