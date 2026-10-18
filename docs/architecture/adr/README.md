# Architecture Decision Records

One short file per significant technical or security decision (Section 3, Refinement 4). Each records
the context, the decision, the consequences and its status. Decisions are superseded, never deleted:
a new ADR replaces an old one and both stay.

The approved Phase 0 blueprint (`Kindred_Phase0_Final_Closed_rev355`, approved October 17, 2026) is
the source of every decision below. Appendix G of the blueprint logs 119 engineering decisions; the
[decision log](decision-log.md) maps each one to the ADR that records it or explains why it needs none.

Status values: **Accepted** (in force), **Accepted, verification pending** (in force, with a check
still open), **Proposed** (requirement approved, design still to be decided), **Superseded by NNNN**.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-modular-monolith-and-layering.md) | Modular monolith with five-project layering | Accepted |
| [0003](0003-aws-cloud-platform.md) | AWS as the cloud platform, Azure as fallback | Accepted |
| [0004](0004-cognito-identity-authorization-in-database.md) | Cognito for identity, authorization in our database | Accepted |
| [0005](0005-tenant-isolation-layers.md) | Layered tenant isolation | Accepted |
| [0006](0006-audit-hash-chain.md) | Tamper-evident audit with a KMS keyed hash chain | Accepted, verification pending |
| [0007](0007-quarantined-file-storage.md) | Private, quarantined file storage with fail-closed scanning | Accepted, verification pending |
| [0008](0008-kindu-release-strategy.md) | Kindu: Coming Soon in V1.0, provider abstraction | Accepted |
| [0009](0009-time-and-identifier-standards.md) | UTC, IANA time zones and UUIDv7 | Accepted |
| [0010](0010-concurrency-and-idempotency.md) | xmin concurrency and idempotency keys | Accepted |
| [0011](0011-client-identity-no-global-registry.md) | Agency-owned clients, no global person registry | Accepted |
| [0012](0012-application-services-not-mediatr.md) | Plain application services, no MediatR | Accepted |
| [0013](0013-expo-router-and-eas-development-builds.md) | Expo Router, TypeScript and EAS development builds | Accepted |
| [0014](0014-api-client-generator.md) | openapi-typescript with openapi-fetch for the generated client | Accepted |
| [0015](0015-api-versioning-and-breaking-change-check.md) | URL versioning and oasdiff breaking-change check | Accepted |
| [0016](0016-repository-protections.md) | GitHub Team ruleset protecting main, and its enforcement proof | Accepted |
| [0017](0017-secret-scanning.md) | gitleaks in CI and as a pre-commit hook | Accepted |
| [0018](0018-dependency-scanning-and-inventory.md) | Dependency scanning, exceptions and inventory | Accepted |
| [0019](0019-postgresql-version-extensions-and-roles.md) | PostgreSQL 18, extensions, migration and application roles | Accepted |
| [0020](0020-default-deny-authorization.md) | Default-deny fallback authorization | Accepted |
| [0021](0021-logging-errors-and-correlation.md) | Redacted structured logging, problem details, correlation IDs | Accepted |
| [0022](0022-design-token-pipeline.md) | Design token pipeline and placeholder flagging | Accepted, verification pending |
| [0023](0023-runtime-versions.md) | .NET 10 LTS and Node.js 22 LTS | Accepted |
| [0024](0024-development-script-safeguards-and-synthetic-seed.md) | Development script safeguards and synthetic seed | Accepted |
| [0025](0025-test-structure.md) | Three .NET test projects, Testcontainers, security trait | Accepted |
| [0026](0026-milestone-1-local-only.md) | Milestone 1 is local only | Accepted |
| [0027](0027-requirements-traceability-and-feature-matrix.md) | Requirements traceability and the feature matrix as checked documents | Accepted |
| [0028](0028-optional-biometric-unlock.md) | Optional biometric authentication for returning users (requirement added 2026-10-17) | Proposed |
