# 0010. xmin concurrency and idempotency keys

- Status: Accepted (convention implemented in Milestone 1)
- Date: 2026-10-17
- Source: Section 2 idempotency and concurrency, Section 4 "One concurrency strategy"

## Decision

- Every mutable table uses PostgreSQL `xmin` as the EF Core concurrency token, mapped only in
  Infrastructure (`ModelConventions`). A conflict returns 409 and never overwrites.
- Documented exceptions: append-only tables (`IAppendOnly`: shift events, care note versions, audit
  events) rely on unique constraints; care note drafts use a `draft_revision` counter; publish and Save
  Changes compare a base version number; audit chain heads use `SELECT ... FOR UPDATE`; shift start and
  end use a conditional update plus a partial unique index.
- Every mutating request carries an idempotency key scoped to the user and organization. A repeat
  returns the original result; the same key with a different body is rejected.
- Every relationship is `ON DELETE RESTRICT`.

## Consequences

Tests: `ModelConventionTests` (REQ-DATA-002, REQ-DATA-004). Idempotency storage arrives with the first
mutating endpoint in Phase 2.
