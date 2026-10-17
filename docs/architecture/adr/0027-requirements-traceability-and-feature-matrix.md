# 0027. Requirements traceability and the feature matrix as checked documents

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3 Refinement 4 (traceability), Section 3 follow-up decisions, Section 7 release rules;
  decisions 65, 82 and 93

## Decision

- [`docs/product/traceability.md`](../../product/traceability.md) gives every approved V1 requirement an
  ID, its blueprint source, its phase or backlog epic, its implementation, its tests and its status.
  `scripts/dev/check-traceability.mjs` (CI `repo-checks`) fails on a duplicate ID, an unknown status, a
  requirement marked Implemented with no test carrying its ID, or a test naming an ID that does not
  exist.
- [`docs/architecture/feature-matrix.md`](../feature-matrix.md) is seeded from Section 7, and
  [`docs/architecture/permissions.json`](../permissions.json) holds the Section 6 catalog and
  permission-by-role matrix. `scripts/dev/check-feature-matrix.mjs` enforces Section 7 release rule 2: it
  fails if a V1 permission appears on no row, if a row names an unknown permission, or if a cell offers a
  feature to a role that holds none of the row's permissions.
- Appendix C scenario IDs are kept as requirement IDs (`REQ-ACC-N1`) so the acceptance tests trace
  directly.

## Note on a blueprint discrepancy

Appendix G decision 20 says administrators hold the media review permission by default, but the later,
approved Section 6 permission-by-role matrix gives `media.consent.review` only to the Media Reviewer
designation, and Section 6 states "No media clearance by default". The matrix is the more specific and
later statement, so `permissions.json` follows Section 6. This is flagged for the founder's confirmation
before Phase 7d; nothing in Milestone 1 depends on it.
