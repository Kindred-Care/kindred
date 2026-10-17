# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3, Refinement 4; Section 3 follow-up decisions; Appendix G (decision-making rules)

## Context

The blueprint requires an ADR for each decision in the plan before the first feature merge, and the
decision-making rules say engineering decisions are made and logged rather than approved one by one.

## Decision

Keep ADRs in `docs/architecture/adr/`, numbered, one decision per file, with context, decision,
consequences and status. A decision is changed by a new ADR that supersedes the old one; nothing is
deleted. Any change to an approved requirement is not an ADR: it goes to the founder as a material
conflict. A failed or inconclusive verification spike produces an ADR with the engineering alternative
(Section 8).

## Consequences

- Reviewers find the reason for every significant choice next to the code.
- CODEOWNERS covers this folder, and new controls in high-risk areas need an ADR (review checklist).
- The Appendix G log stays the record of the Phase 0 decisions; [decision-log.md](decision-log.md)
  maps it to these files.
