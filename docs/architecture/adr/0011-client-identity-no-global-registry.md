# 0011. Agency-owned clients, no global person registry

- Status: Accepted
- Date: 2026-10-17
- Source: Section 4 "Client identity and future legacy architecture" (decided October 16, 2026), which
  requires an ADR for this decision

## Decision

- Each organization owns its client records and everything attached to them.
- No global person registry and no automatic cross-agency matching in V1. Serving the same person gives
  an organization no access to another organization's records.
- No tables for global identity, cross-agency sharing or a legacy archive are built in V1. The listed
  extension points (global users, Moments linked only to client and organization, typed consents,
  checksums, IDs never exposed across organizations) are kept.
- A future family-owned legacy archive copies authorized content with provenance, behind its own ADR
  and legal review, and never links agencies by name, birthdate or similarity.
