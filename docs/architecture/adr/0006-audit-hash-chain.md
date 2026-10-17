# 0006. Tamper-evident audit with a KMS keyed hash chain

- Status: Accepted, verification pending (KMS load test S2; checkpoint interval and key rotation
  cadence set in the security review)
- Date: 2026-10-17
- Source: Section 2 audit tamper-resistance and hash-chain implementation (approved October 16, 2026),
  Section 4 audit events and integrity

## Decision

- Append-only `AuditEvents`; the application role can insert, never update or delete.
- Per-organization chains plus one platform chain. Inside the audited transaction: lock the chain head,
  compute the SHA-256 digest of the canonical event, ask KMS `GenerateMac` (HMAC-SHA-256) over the
  previous chain value, digest, chain ID and sequence, insert, update the head. A KMS failure rolls back
  and fails closed.
- Checkpoints to a write-once bucket in the separate security account, periodic and full verification,
  alarms, and an incident procedure. Archive with S3 Object Lock in Governance mode until counsel
  confirms retention periods and the founder approves Compliance mode.
- Events record who, what and when, never clinical content. Reads of sensitive data audit before
  returning; a failed audit write fails the request. Denied requests are audited in their own
  transaction.

## Consequences

Built in Phase 2 (backlog B5). The write latency and cost per event are measured first (spike S2).
