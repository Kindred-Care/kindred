# Requirements traceability

Every approved V1 requirement from the Phase 0 blueprint (`Kindred_Phase0_Final_Closed_rev355`, approved
October 17, 2026) with an ID, its source, the phase and backlog epic that delivers it, its implementation,
its tests and its status (Section 3, Refinement 4). Requirement wording here is a short paraphrase; the
blueprint is authoritative.

`scripts/dev/check-traceability.mjs` runs in CI (`repo-checks`) and fails if an ID is duplicated, a status
is unknown, a requirement marked **Implemented** or **Partial** has no test carrying its ID, or a test
names an ID that is not listed here. Test names carry the ID: `REQ_SEC_001_...` in C#,
`'REQ-SEC-001 ...'` in JavaScript.

| Status | Meaning |
| --- | --- |
| Implemented | Built and covered by passing tests that carry the ID |
| Verified | Proven by recorded evidence rather than a code test (for example the branch-protection rejections); the Tests column names the evidence |
| Partial | Built and tested in part; the rest needs evidence not yet produced (named in the Tests column) |
| Provisional | Built against placeholders; final acceptance needs approved inputs |
| Blocked | Cannot be completed until a named prerequisite is met |
| Planned | Not started; delivered in the phase shown |
| Process | A governance rule followed by people, recorded but not testable in code |

Sources: § = blueprint section, App. = appendix, decision N = Appendix G entry. Phases and epics are from
Section 8.

## Contents

- [Milestone 1 (Phase 1 foundation)](#milestone-1-phase-1-foundation)
- [Product-owner requirements (Appendix A)](#product-owner-requirements-appendix-a)
- [Architecture (Section 2)](#architecture-section-2)
- [Repository and mobile architecture (Section 3)](#repository-and-mobile-architecture-section-3)
- [Database (Section 4)](#database-section-4)
- [Identity and organizations](#identity-and-organizations)
- [Authentication and authorization (Section 6a)](#authentication-and-authorization-section-6a)
- [Permissions (Section 6)](#permissions-section-6)
- [Clients and the care team](#clients-and-the-care-team)
- [Scheduling and time](#scheduling-and-time)
- [Care notes](#care-notes)
- [Offline drafts](#offline-drafts)
- [Moments, media and files](#moments-media-and-files)
- [Consent and authority](#consent-and-authority)
- [Requests, evidence, documents and reports](#requests-evidence-documents-and-reports)
- [Notifications](#notifications)
- [Organization lifecycle and platform operations](#organization-lifecycle-and-platform-operations)
- [Navigation (Section 5)](#navigation-section-5)
- [Feature matrix release rules (Section 7)](#feature-matrix-release-rules-section-7)
- [Kindu](#kindu)
- [Security and compliance (Section 9)](#security-and-compliance-section-9)
- [Gates and spikes (Section 8)](#gates-and-spikes-section-8)
- [Acceptance scenarios (Appendix C)](#acceptance-scenarios-appendix-c)

## Milestone 1 (Phase 1 foundation)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-PLAT-001 | `docker compose up` plus one documented command starts PostgreSQL and the API | §10 C1 | 1 / B1 | `compose.yaml`, `backend/Dockerfile`, `.dockerignore`, `npm run setup` | Verified | docs/acceptance/m1/c1-compose-run.txt; CI smoke step on PR #2 (docs/acceptance/m1/github-ci-evidence.md) |
| REQ-PLAT-002 | `GET /v1/health` returns 200 with a database check, 503 when the database is unreachable, and no internal details | §10 C1, §10 scope | 1 / B1 | `HealthController`, `HealthService`, `DatabaseHealthProbe` | Implemented | HealthServiceTests<br>HealthEndpointTests<br>client.test.ts |
| REQ-PLAT-003 | Every route is versioned under `/v1` | §3 R2.5 | 1 / B1 | `[Route("v1/...")]`; ADR 0015 | Implemented | EndpointDeclarationTests |
| REQ-PLAT-004 | Standard error responses: problem details with a fixed title, status and correlation ID only | §10 scope | 1 / B1 | `ProblemResponses`; ADR 0021 | Implemented | ApiUnitTests<br>DefaultDenyTests |
| REQ-PLAT-005 | Every request has a correlation ID in the response header, logs and errors; only opaque caller IDs are accepted | §10 scope | 1 / B1 | `CorrelationId` | Implemented | ApiUnitTests<br>HealthEndpointTests |
| REQ-PLAT-006 | Structured logging with redaction: a fake token and a fake client name never reach the logs | §9 principle 3, §10 C11 | 1 / B1 | `RequestLogging`, `RedactingLoggerProvider`; ADR 0021 | Implemented | ApiUnitTests<br>LogRedactionTests |
| REQ-PLAT-007 | The Section 3 repository structure and hygiene files exist (apps/web reserved, editor settings, PR template, CODEOWNERS, review checklist) | §3, §10 scope | 1 / B1 | `scripts/dev/check-repo.mjs` | Implemented | check-repo.test.mjs |
| REQ-PLAT-008 | No secrets in the repository; `.env.example` documents every variable; gitleaks in CI and as a pre-commit hook | §3, §9, §10 C7 | 1 / B1 | `.gitleaks.toml`, `.githooks/pre-commit`, CI `secret-scan`; ADR 0017 | Implemented | check-repo.test.mjs; CI secret-scan |
| REQ-PLAT-009 | Synthetic data only: no real client data or Figma photographs in code, fixtures or seed; images only in placeholder folders | §3 follow-up, §10 | 1 / B1 | `check-repo.mjs` image rule | Implemented | check-repo.test.mjs |
| REQ-PLAT-010 | Protected main: pull requests, required up-to-date checks, no direct or force pushes, no deletion, applied to administrators; enforcement proven | §3 R4, §10 C8 C9 | 1 / B1 | Ruleset `main-protection`; ADR 0016 | Verified | docs/architecture/adr/evidence/0016-enforcement.md (all four attempts rejected, admin included) |
| REQ-PLAT-011 | Domain references no persistence or cloud code; Application does not reference Infrastructure or Api; Infrastructure does not reference Api | §2, §3 R3 | 1 / B1 | Project references; ADR 0002 | Implemented | LayeringTests |
| REQ-PLAT-012 | Controllers do not use the database context directly | §3 R3 | 1 / B1 | ADR 0002 | Implemented | LayeringTests |
| REQ-PLAT-013 | The OpenAPI document is committed and the TypeScript client is generated from it; CI fails on drift | §3 R2, §10 C12 | 1 / B1 | `docs/api/openapi.json`, `scripts/codegen`, CI `contract`; ADR 0014 | Implemented | client.test.ts; CI contract |
| REQ-PLAT-014 | A breaking specification change is flagged | §3 R2.5, §10 C12 | 1 / B1 | oasdiff in CI `contract`; ADR 0015 | Verified | oasdiff flagged the breaking change on probe PR #5 (docs/acceptance/m1/github-ci-evidence.md) |
| REQ-PLAT-015 | Development scripts refuse to run outside Local, off the database allowlist or with unlisted AWS credentials; destructive scripts need typed confirmation | §3 R4, §10 C14 | 1 / B1 | `scripts/dev/lib/local-guard.mjs`; ADR 0024 | Implemented | local-guard.test.mjs |
| REQ-PLAT-016 | The seed generates synthetic data only and refuses anything that looks real | §3 R4, §10 C14 | 1 / B1 | `scripts/seed`; ADR 0024 | Implemented | synthetic.test.mjs |
| REQ-PLAT-017 | `design/tokens/tokens.json` is the source; `tokens.ts` is generated and CI fails on drift; no inline hex values | §3 R4, §10 C3 | 1 / B6 | `scripts/codegen/tokens.mjs`, ESLint rule; approved values from the design brief; ADR 0022 | Implemented | tokens-lib.test.mjs<br>theme.test.ts |
| REQ-PLAT-018 | Text and background token pairs meet WCAG 2.2 AA; placeholders are flagged and the build warns | §3 R4, §10 C4 | 1 / B6 | CI `design-tokens`; 11 approved pairs; documented defaults listed separately | Implemented | tokens-lib.test.mjs<br>theme.test.ts |
| REQ-PLAT-019 | CI on every pull request runs lint, typecheck, build, unit, integration, architecture and mobile tests, the contract check, dependency and secret scans, with the security suite reported separately | §3, §10 C5 | 1 / B1 | `.github/workflows/ci.yml`; ADR 0018 | Implemented | check-npm-audit.test.mjs; CI run |
| REQ-PLAT-020 | Every project has at least one passing unit test and a README lets a new developer start both apps in under 30 minutes | §10 C6 | 1 / B1 | README | Partial | Test run; timed walkthrough |
| REQ-PLAT-021 | ADRs for the plan's decisions, the traceability file and the feature matrix are populated and checked | §3 follow-up, §10 C8 | 1 / B1 | `docs/architecture`, `docs/product`; ADR 0027 | Implemented | check-feature-matrix.test.mjs; check-traceability.test.mjs |
| REQ-SEC-001 | An endpoint with no declared permission is denied (fallback and default policies deny all; unknown permissions deny) | §6a, §10 C10 | 1 / B1 | `PermissionPolicyProvider`; ADR 0020 | Implemented | ApiUnitTests<br>HealthServiceTests<br>DefaultDenyTests |
| REQ-SEC-002 | Every endpoint declares a permission or is explicitly public with a reason; health is the only public endpoint; the build fails otherwise | §6a, §10 C10 | 1 / B1 | `RequirePermission`, `PublicEndpoint`; ADR 0020 | Implemented | EndpointDeclarationTests<br>ApiUnitTests |
| REQ-SEC-003 | Tokens a caller sends are ignored until real sign-in exists; protected requests get 401 | §10 out of scope, §6a | 1 / B1 | `NoSignInAuthenticationHandler` | Implemented | DefaultDenyTests |
| REQ-DATA-001 | UUIDv7 primary keys generated by the application | §2, §4 | 1 / B1 | `Identifiers`, `Entity`, `ModelConventions`; ADR 0009 | Implemented | IdentifierTests<br>ModelConventionTests |
| REQ-DATA-002 | `xmin` concurrency token on mutable tables; append-only tables excepted | §4 | 1 / B1 | `ModelConventions`; ADR 0010 | Implemented | ModelConventionTests |
| REQ-DATA-003 | Instants are UTC `timestamptz`; snake_case naming in schema `kindred` | §2, §4 | 1 / B1 | `ModelConventions`, `DatabaseOptions` | Implemented | ModelConventionTests |
| REQ-DATA-004 | No cascading deletes | §4 | 1 / B1 | `ModelConventions` | Implemented | ModelConventionTests |
| REQ-DATA-005 | The EF baseline applies to an empty database | §10 C13 | 1 / B1 | Baseline migration | Implemented | DatabaseBaselineTests |
| REQ-DATA-006 | Separate migration and application roles; the application role cannot change the schema and has no elevated attributes | §4, §6a, §10 C13 | 1 / B1 | `scripts/dev/db/init/01-roles.sh`; ADR 0019 | Implemented | DatabaseBaselineTests |
| REQ-DATA-007 | PostgreSQL version and `btree_gist` / `pg_trgm` availability are recorded | §4, §10 C13, S7 | 1 / B1 | ADR 0019 | Implemented | DatabaseBaselineTests |
| REQ-DATA-008 | Migrations run under the migration role, never at application start-up | §4 | 1 / B1 | `migrate` service, EF bundle | Implemented | ModelConventionTests; compose run |
| REQ-MOB-001 | The app shows the splash, then Log In, with no console errors, on an iOS simulator and an Android emulator | §10 C2 | 1 / B6 | `app/(auth)`, `src/features/auth` | Partial | SplashScreen.test.tsx<br>LogInScreen.test.tsx<br>Android emulator run passed 2026-10-17 (docs/acceptance/m1); iOS simulator Blocked |
| REQ-MOB-002 | Log In has screen reader labels and supports dynamic type to 200% without clipping; labels beside their fields, stacking above them when they no longer fit (Q1, founder-confirmed) | §10 C4, §1 obs. 2 | 1 / B6 | `LogInScreen`, `LabeledTextField` | Partial | LogInScreen.test.tsx<br>Android emulator re-run for the confirmed layout (docs/acceptance/m1); iOS Dynamic Type Blocked |
| REQ-MOB-003 | Splash and Log In match the Figma at 390 pt within an agreed tolerance, using tokens with no inline hex | §10 C3 | 1 / B6 | Approved tokens and Inter; ADR 0022; tolerance ±2 pt at 390 and 402 pt (design brief 6b) | Provisional | SplashScreen.test.tsx<br>LogInScreen.test.tsx<br>Side-by-side captures against the Figma frame exports (P1, not yet provided) |
| REQ-MOB-004 | An EAS development build installs and launches on one physical iOS and one physical Android device | §10 C15 | 1 / B1 | `eas.json`, `expo-dev-client`; ADR 0013 | Blocked | Recorded runs |

## Product-owner requirements (Appendix A)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-PO-001 | Save Draft or Publish directly, with no approval or review queue | App. A #1; § 4, 6, 7, 8 | 6 / B14 |  | Planned |  |
| REQ-PO-002 | Only the original author edits a published note | App. A #2; § 4, 6a | 6 / B14 |  | Planned |  |
| REQ-PO-003 | Immutable versions; autosave creates none | App. A #3; § 4 | 6 / B14 |  | Planned |  |
| REQ-PO-004 | Paragraph narrative with optional structured sections | App. A #4; § 4 | 6 / B14 |  | Planned |  |
| REQ-PO-005 | Drafts private; administrators see an indicator; no automatic reassignment | App. A #5; § 4 | 6 / B15 |  | Planned |  |
| REQ-PO-006 | Wrong-client reporting with administrator oversight | App. A #6; § 4 | 6 / B16 |  | Planned |  |
| REQ-PO-007 | 48-hour post-assignment grace, revocable, then an exception | App. A #7; § 4 | 6 / B15 |  | Planned |  |
| REQ-PO-008 | One unified Moments timeline | App. A #8; § 4, 5 | 7d / B25 |  | Planned |  |
| REQ-PO-009 | Captions only on photos or videos | App. A #9; § 4 | 7d / B25 |  | Planned |  |
| REQ-PO-010 | Note media inside one entry, with no duplicates | App. A #10; § 4 | 7d / B25 |  | Planned |  |
| REQ-PO-011 | Agency offboarding with a 60-day export window | App. A #11; § 4 | 9 / B31 |  | Planned |  |
| REQ-PO-012 | Restricted pending uploads with a 7-day escalation | App. A #12; § 4 | 7d / B23 |  | Planned |  |
| REQ-PO-013 | Recording authority rules (client, scoped representative, documented care-operations basis) | App. A #13; § 4 | 7c / B20 |  | Planned |  |
| REQ-PO-014 | Withdrawal ends consent-based family access at once; checks on every retrieval | App. A #14; § 4 | 7c / B20 |  | Planned |  |
| REQ-PO-015 | Risk-based review of other people; crop, blur and protected originals | App. A #15; § 4 | 7b / B19 |  | Planned |  |
| REQ-PO-016 | Shared clearance only where the consent scope covers both purposes | App. A #16; § 4 | 7d / B23 |  | Planned |  |
| REQ-PO-017 | Rights requests from every channel, with correction statements | App. A #17; § 4 | 8 / B26 |  | Planned |  |
| REQ-PO-018 | Minors: authority by action, 90-day notice, transition | App. A #18; § 4 | 4 / B10 |  | Planned |  |
| REQ-PO-019 | Diagnoses off lists and dashboards; care alerts on authorized views | App. A #19; § 1, 4 | 4 / B7 |  | Planned |  |
| REQ-PO-020 | Reporting in PDF, CSV and Excel, with separate view and export permissions | App. A #20; § 4, 6 | 8 / B30 |  | Planned |  |
| REQ-PO-021 | RPO 15 minutes and RTO 4 hours (component and zone failures) | App. A #21; § 2 | 9, 11 / B34 |  | Planned |  |
| REQ-PO-022 | Offline drafts with automatic synchronization, never publishing | App. A #22; § 3, 4 | 6 / B17 |  | Planned |  |
| REQ-PO-023 | Defined behaviour when authorization lapses offline | App. A #23; § 4 | 6 / B17 |  | Planned |  |
| REQ-PO-024 | Kindred support access and break-glass | App. A #24; § 4 | 9 / B33 |  | Planned |  |
| REQ-PO-025 | No GPS in V1 | App. A #25; § 4 | 5 / B11 |  | Planned |  |
| REQ-PO-026 | All tiers include all features; pricing by caregiver count; no feature flags by tier | App. A #26; § Product | All |  | Planned |  |
| REQ-PO-027 | Kindu is future; no live AI in V1 | App. A #27; § 2 | 10 / B35 |  | Planned |  |
| REQ-PO-028 | Independent agency clients, no global identity, future family-owned legacy | App. A #28; § 4 | 4 / B7 |  | Planned |  |
| REQ-PO-029 | Mobile parity for caregivers and employers | App. A #29; § All | All |  | Planned |  |
| REQ-PO-030 | Mandatory in-app photo and video crop and blur, including moving subjects | App. A #30; § 2, 3, 4 | 7b / B19 |  | Planned |  |
| REQ-PO-031 | Blur is optional and selectable (individuals, region, everyone visible), with preview | App. A #31; § 4 | 7b / B19 |  | Planned |  |
| REQ-PO-032 | No unblurred original may leak; nothing publishes until checks succeed | App. A #32; § 4 | 7b, 7d / B19 B23 |  | Planned |  |
| REQ-PO-033 | In-app person-specific consent capture and separate audio privacy | App. A #33; § 4 | 7c / B20 |  | Planned |  |
| REQ-PO-034 | Audio on by default with a visible mute; muting only where rules require | App. A #34; § 4 | 7b / B19 |  | Planned |  |
| REQ-PO-035 | Reusable person-specific authorizations, 12-month default, automatic reuse, reminders, withdrawal | App. A #35; § 4 | 7c / B20 |  | Planned |  |
| REQ-PO-036 | No automatic blurring of friends, staff or family; detection assists and never blocks | App. A #36; § 4 | 7b / B19 |  | Planned |  |
| REQ-PO-037 | Media features are mandatory and not cost-dependent | App. A #37; § 2 | 7 / S1 |  | Planned |  |
| REQ-PO-038 | Minimal-interruption workflow that preserves work when review is required | App. A #38; § 4 | 7d / B23 |  | Planned |  |
| REQ-PO-039 | Media Consent Dashboard for agency personnel only | App. A #39; § 4, 5, 6, 7 | 7c / B21 |  | Planned |  |
| REQ-PO-040 | Decision-making rules: approved requirements are authoritative, decisions logged, legal questions to counsel | App. A #40; Preamble | All | ADR 0001; decision log | Process | Governance rule; not testable in code |
| REQ-PO-041 | Operational care documentation is distinct from family or public sharing | App. A #41; § 4 | 8 / B27 |  | Planned |  |
| REQ-PO-042 | No extra mandatory review steps or media restrictions beyond law, program rules and policy | App. A #42; § 4 | 7d / B23 |  | Planned |  |
| REQ-PO-043 | Photo and video library imports, with provenance and unverified device metadata | App. A #43; § 3, 4 | 7b / B19 |  | Planned |  |
| REQ-PO-044 | Limited remote media consent through a scoped, expiring link, without an account | App. A #44; § 3, 4, 6, 6a, 7 | 7c / B22 |  | Planned |  |
| REQ-PO-045 | A completed written note publishes while its media is pending; cleared media joins through a new version | App. A #45; § 4 | 6, 7d / B14 B25 |  | Planned |  |

## Architecture (Section 2)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ARCH-001 | Organization context in the route (`/v1/organizations/{orgId}/...`) with an active-membership check on every request | §2 key decisions | 2 / B4 |  | Planned |  |
| REQ-ARCH-002 | Three-layer authorization: permission, client scope, field level | §2, §6a | 2 / B4 |  | Planned |  |
| REQ-ARCH-003 | Each command runs in one transaction with its audit event, notifications and idempotency record | §2 safeguards | 2 / B5 |  | Planned |  |
| REQ-ARCH-004 | A sensitive read audits before returning; a failed audit write fails the request; denials audited separately | §2 safeguards | 2 / B5 |  | Planned |  |
| REQ-ARCH-005 | Side effects outside the database use an outbox table | §2 safeguards | 2 / B5 |  | Planned |  |
| REQ-ARCH-006 | Failure-injection tests prove no partial change and no missing audit event | §2 safeguards | 2 / B5 |  | Planned |  |
| REQ-ARCH-007 | Idempotency keys scoped to user and organization; same key with a different body rejected | §2 | 2 / B4 |  | Planned |  |
| REQ-ARCH-008 | Optimistic concurrency returns 409 and never overwrites | §2 | 2 / B4 |  | Planned |  |
| REQ-ARCH-009 | Audit tamper resistance: append-only, KMS keyed hash chain, checkpoints, verification, archive, alarms, audit.read only | §2 | 2 / B5 |  | Planned |  |
| REQ-ARCH-010 | Retention periods set only after counsel review; legal holds suspend deletion; purges are audited | §2, §4 | 9 / B32 |  | Planned |  |
| REQ-ARCH-011 | Object Lock in Governance mode; Compliance mode only with counsel and founder approval | §2 | 9 / B32 |  | Planned |  |
| REQ-ARCH-012 | Portability rules: containers, plain PostgreSQL, standard OIDC, interfaces for storage, secrets, email and push, Terraform | §2 | All |  | Planned |  |
| REQ-ARCH-013 | Workspace switching is a choice, never a grant; verified by the server, audited, caches cleared | §2, §3 | 2 / B2 |  | Planned |  |
| REQ-ARCH-014 | Media processing pipeline: Rekognition detection and tracking, FFmpeg render on Fargate, quality check, manual keyframe fallback | §2 | 7b / B19 |  | Planned |  |
| REQ-ARCH-015 | Media scaling: no limits imposed for cost, segment-and-join for long videos, fair scheduling, budget alerts that never throttle | §2 | 7b / B19 |  | Planned |  |

## Repository and mobile architecture (Section 3)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-REPO-001 | Feature-based mobile organization and thin route files | §3 R1 | 1 / B6 | `apps/mobile/app`, `src/features`; ADR 0013 | Implemented | tsc (thin re-exports) |
| REQ-REPO-002 | Route groups (auth), (workspace) with caregiver and organization subtrees, (requester) | §3 R1 | 3 / B6 |  | Planned |  |
| REQ-REPO-003 | Centralized route guards: authentication, workspace membership, navigation authorization; deep links use the same guards | §3 R1 | 3 / B6 |  | Planned |  |
| REQ-REPO-004 | 401 triggers one refresh then sign-out; 403 refreshes the access context | §3 R1 | 2 / B2 |  | Planned |  |
| REQ-REPO-005 | Query keys built by the key factory, scoped by user, organization and workspace; hand-built keys rejected | §3 R2 | 2 / B6 |  | Planned |  |
| REQ-REPO-006 | Query cache in memory only; media cached in memory only; only tokens in secure storage | §3 R2 | 2 / B2 |  | Planned |  |
| REQ-REPO-007 | Cache cleanup on log out, workspace switch, membership revoked, permission change, expiry and background | §3 R2 | 2 / B2 |  | Planned |  |
| REQ-REPO-008 | Architecture tests: every tenant-to-tenant relationship is composite; database catalog test rejects single-column tenant FKs | §4 | 2 / B4 |  | Planned |  |
| REQ-REPO-009 | Public consent page in Kindred.Api references only the ConsentLinks service (architecture test) | §3 R1 | 7c / B22 |  | Planned |  |
| REQ-REPO-010 | Media editor feature module with app-private capture and deletion after confirmed upload | §3 R1 | 7b / B19 |  | Planned |  |

## Database (Section 4)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-DB-001 | Every tenant table has organization_id NOT NULL and UNIQUE (organization_id, id) | §4 | 2 / B4 |  | Planned |  |
| REQ-DB-002 | Composite foreign keys between tenant tables, enforced in EF configuration, an architecture test and a catalog test | §4 | 2 / B4 |  | Planned |  |
| REQ-DB-003 | Status columns are text with CHECK constraints | §4 | 2+ |  | Planned |  |
| REQ-DB-004 | Each table in the V1 inventory is built with its specified constraints and triggers | §4 inventory | 2 to 9 |  | Planned |  |
| REQ-DB-005 | Row-Level Security with FORCE on every tenant table and on draft author; API role without BYPASSRLS | §4, decision 36 | 2 / B4 |  | Planned |  |
| REQ-DB-006 | Destructive migrations are labelled, backed up and independently reviewed when they touch security tables | §4 | All |  | Planned |  |
| REQ-DB-007 | Expand-and-contract migrations compatible with the previous application version | §4 | All |  | Planned |  |
| REQ-DB-008 | Indexes only for documented access patterns, reviewed after load testing | §4 | 2+ |  | Planned |  |

## Identity and organizations

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ID-001 | Users are global; an identity links to a user only by invitation redemption or provisioning, never by email match | §4 | 2 / B3 |  | Planned |  |
| REQ-ID-002 | Memberships reused on reinstatement; status history append-only | §4 | 2 / B3 |  | Planned |  |
| REQ-ID-003 | Roles per membership with effective dates; designations are dated roles | §4, §6 | 2 / B3 |  | Planned |  |
| REQ-ID-004 | Invitations are hashed, single-use, bound to one organization and email, and expire after 7 days | §4, decision 3 | 4 / B8 |  | Planned |  |
| REQ-ID-005 | Organization states; nonpayment suspension restricts use and never starts disposal | §4 | 9 / B31 |  | Planned |  |

## Authentication and authorization (Section 6a)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-AUTH-001 | OIDC authorization code with PKCE in the system browser; sign-in by email; app and API never see passwords | §6a, decision 1 | 2 / B2 |  | Planned |  |
| REQ-AUTH-002 | Tokens only in Keychain or Keystore | §6a | 2 / B2 |  | Planned |  |
| REQ-AUTH-003 | 15-minute access tokens, refresh rotation, 5-minute app lock, full sign-in every 30 days | §6a, decision 4 | 2 / B2 |  | Planned |  |
| REQ-AUTH-004 | MFA for every staff account; authenticator apps or passkeys preferred | §6a | 2 / B2 |  | Planned |  |
| REQ-AUTH-005 | The API validates signature, issuer, audience, expiry and token type on every call | §6a | 2 / B2 |  | Planned |  |
| REQ-AUTH-006 | One generic message for any failed sign-in or reset | §6a | 2 / B2 |  | Planned |  |
| REQ-AUTH-007 | Throttling and lockout of repeated failures; rate limits at the load balancer and API | §6a | 2 / B2 |  | Planned |  |
| REQ-AUTH-008 | All checks through one access evaluator; controllers contain no checks | §6a | 2 / B4 |  | Planned |  |
| REQ-AUTH-009 | Memberships and grants checked against the database on every request; tokens carry identity only | §6a | 2 / B4 |  | Planned |  |
| REQ-AUTH-010 | A resource in another organization returns not found | §6a | 2 / B4 |  | Planned |  |
| REQ-AUTH-011 | Nobody grants a permission they do not hold; the last administrator cannot be removed | §6, §6a | 2 / B3 |  | Planned |  |
| REQ-AUTH-012 | No impersonation, act-as or shared session for any role | §6, §6a, decision 68 | 2 / B4 |  | Planned |  |
| REQ-AUTH-013 | Sign-ins, MFA events, denials, role changes and workspace switches are audited | §6a | 2 / B5 |  | Planned |  |
| REQ-AUTH-014 | The authorization test matrix is generated from the catalog and role matrix; a permission without a test fails the build | §6a, decision 65 | 2 / B4 |  | Planned |  |
| REQ-AUTH-015 | Access lifecycle tests: removal, disablement, role change, old sessions, removal during a shift, assignment, consent, offline, reviewer, originals, cross-organization | §6a | 2+ |  | Planned |  |
| REQ-AUTH-016 | Only sign-in and consent-link routes are reachable without a signed-in user | §6a | 2, 7c |  | Planned |  |
| REQ-AUTH-017 | Optional biometric authentication for returning users: device-native Face ID and Touch ID on iOS, strong (Class 3) biometrics on Android | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-018 | Biometric enrollment is offered only after a successful standard sign-in | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-019 | Biometrics unlock an eligible authenticated session or release a protected reauthentication credential, then the normal Cognito refresh applies | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-020 | A secure, supported, accessible non-biometric sign-in and unlock method always remains available, including whenever biometric unlock is disabled or unavailable | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-021 | Device-native biometrics only: Kindred never collects or stores biometric templates or data, passwords for replay, or unprotected tokens | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-022 | Biometric use respects Cognito, MFA, session expiry (including the 30-day full sign-in), server-side authorization, revocation and device security; it never satisfies step-up MFA | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-023 | Users can disable biometric access | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-024 | Reauthentication is required when device biometric enrollment changes or the protected credential is invalidated | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-025 | Biometric enrollment is unavailable on devices that fail integrity attestation | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-026 | Biometric unlock is optional for each user and is never required to access Kindred | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-027 | Organization administrators can disable biometric unlock for their organization, as an organization setting gated by the existing organization.manage permission; the change is audited | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-028 | An organization prohibition overrides the user's preference; for a user in several organizations the most restrictive setting applies (ADR 0028, point A) | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-029 | Disabling biometric unlock (by the user or the organization) removes the biometric gate and its credential copy without ending otherwise valid sessions | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-030 | The organization policy reaches devices through the server-side access context as a per-user, per-device snapshot refreshed on launch, foreground, token refresh, 403 and sign-in | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-031 | Biometric unlock never relies indefinitely on a stale policy: each policy snapshot has a bounded, server-set validity period (proposed 24 hours; design requires founder review before development) | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-032 | Biometric unlock fails closed when the policy snapshot is expired, missing, for another user or device, or cannot be verified, including when the device clock is set back | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |
| REQ-AUTH-033 | Failing closed withholds only biometric unlock: the session continues, the biometric credential copy is kept without re-enrolment, and a supported non-biometric path remains, online and offline | Founder 2026-10-17 (requirement-changes.md) | 2 / B2 | ADR 0028 | Planned |  |

## Permissions (Section 6)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-PERM-001 | Fixed catalog of 65 permissions plus 2 reserved, seeded, with the approved permission-by-role matrix | §6 | 2 / B3 |  | Planned |  |
| REQ-PERM-002 | Scope in the permission name: no suffix is assigned or own, .all is organization-wide | §6, decision 57 | 2 / B3 |  | Planned |  |
| REQ-PERM-003 | Three designations: Media Reviewer, Restricted Original Custodian, Export Custodian | §6, decision 58 | 2 / B3 |  | Planned |  |
| REQ-PERM-004 | Designations need designations.assign, step-up MFA, audit and notice; custodian of originals never self-assigned | §6 | 2 / B3 |  | Planned |  |
| REQ-PERM-005 | Separation of duties: reviewer is not uploader, verifier is not recorder, no self-approval, following the person | §6 | 2+ |  | Planned |  |
| REQ-PERM-006 | Step-up MFA for audit.read, holds, support approval, export, originals and designations | §6 | 2 / B3 |  | Planned |  |
| REQ-PERM-007 | organization.export only for Export Custodians while a window is open | §6 | 9 / B31 |  | Planned |  |
| REQ-PERM-008 | Narrow capabilities for requester, external reviewer, remote signer, support grantee and platform roles | §6 | 7c, 8, 9 |  | Planned |  |
| REQ-PERM-009 | Solo-agency export and media review processes | §6 | 7d, 9 |  | Planned |  |
| REQ-PERM-010 | Self-service needs only an active membership | §6 | 2+ |  | Planned |  |

## Clients and the care team

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-CLI-001 | Client directory, profile, add, edit and archive | §4, §5 | 4 / B7 |  | Planned |  |
| REQ-CLI-002 | Diagnoses only inside authorized profiles; never in lists, dashboards, search, notifications or exports | §1 obs. 5, §4 | 4 / B7 |  | Planned |  |
| REQ-CLI-003 | OpenAPI contract test fails if a clinical field appears in a list or summary schema | §4 | 4 / B7 |  | Planned |  |
| REQ-CLI-004 | Contacts and internal and external care team members | §1 obs. 4, §4 | 4 / B7 |  | Planned |  |
| REQ-CLI-005 | Care alerts: concise instructions, 280 characters, review every 90 days, overdue shown and reported | §4, decision 10 | 4 / B7 |  | Planned |  |
| REQ-CLI-006 | Assignments with history and an exclusion constraint against overlaps | §4 | 4 / B9 |  | Planned |  |
| REQ-CLI-007 | Representative authority by action, verified with evidence and review dates | §4 | 4 / B10 |  | Planned |  |
| REQ-CLI-008 | Death recorded separately; death or archival never deletes Moments or grants family access | §4 | 4 / B7 |  | Planned |  |
| REQ-CLI-009 | Add Client shown only with clients.create | §1 obs. 9 | 4 / B7 |  | Planned |  |
| REQ-CLI-010 | Assignments end on suspension or deactivation; one-click restore | decision 8 | 4 / B9 |  | Planned |  |

## Scheduling and time

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-SHIFT-001 | Schedules and shift management; start and end with idempotency and atomic updates | §2, §4 | 5 / B11 |  | Planned |  |
| REQ-SHIFT-002 | Shift events append-only, EVV-ready, no location | §4 | 5 / B11 |  | Planned |  |
| REQ-SHIFT-003 | Overlapping scheduled shifts allowed with a warning; one shift in progress per caregiver | decision 5 | 5 / B11 |  | Planned |  |
| REQ-SHIFT-004 | Late after 15 minutes, Missed at the scheduled end | decision 6 | 5 / B11 |  | Planned |  |
| REQ-SHIFT-005 | Late-received or clock-skewed shift events flagged | decision 7 | 5 / B11 |  | Planned |  |
| REQ-SHIFT-006 | Adjustments, missed punches and removal during a shift resolved with shifts.adjust | §6a, decision 71 | 5 / B12 |  | Planned |  |
| REQ-SHIFT-007 | Timesheet review append-only and separate from note publishing | §4 | 5 / B13 |  | Planned |  |
| REQ-SHIFT-008 | Device registration with lease, remote wipe and revocation | §4, §8 | 5 / B8 |  | Planned |  |

## Care notes

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-NOTE-001 | Drafts with autosave to a private working copy, revision checks and idempotency | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-002 | Publish, Save Changes and Attach as single transactions creating immutable versions | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-003 | Versions hold narrative, sections, media set, editor, time, basis, reason and hash | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-004 | Server-computed word-level comparison between versions | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-005 | Authorization basis recorded on every create, edit and publish | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-006 | Documentation exceptions approved by someone other than the author, time-boxed | §4 | 6 / B15 |  | Planned |  |
| REQ-NOTE-007 | Grace measured from the assignment's actual effective end | §4, decision 9 | 6 / B15 |  | Planned |  |
| REQ-NOTE-008 | Sealed drafts: unreadable, retained, indicator only, disposition without reading | §4 | 6 / B15 |  | Planned |  |
| REQ-NOTE-009 | Outstanding-draft indicator view with no content | §4 | 6 / B15 |  | Planned |  |
| REQ-NOTE-010 | Wrong-client case restricts at once and never rewrites the original | §4 | 6 / B16 |  | Planned |  |
| REQ-NOTE-011 | Correction reasons supported per documentation rules | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-012 | Care-occurred, created, published and last-modified times kept separate | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-013 | Reinstatement never restores editing automatically | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-014 | Optional shift link that cannot cite another client's shift | §4 | 6 / B14 |  | Planned |  |
| REQ-NOTE-015 | Pending note media never in a version and visible only to uploader and reviewers | §4 | 6, 7d / B25 |  | Planned |  |
| REQ-NOTE-016 | Entries documented more than 24 hours after care are flagged late | decision 12 | 6 / B14 |  | Planned |  |

## Offline drafts

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-OFF-001 | Encrypted local store for care-note drafts with hardware-backed and lease keys, excluded from backups | §4 | 6 / B17 |  | Planned |  |
| REQ-OFF-002 | Every synchronization rechecks authorization; offline grants no access | §4, decision 88 | 6 / B17 |  | Planned |  |
| REQ-OFF-003 | 7-day lease; locked drafts kept 30 days then erased with notice; logout offers sync now, keep locked, discard | §4, decision 30 | 6 / B17 |  | Planned |  |
| REQ-OFF-004 | Sync state machine with retry, conflict, held pending exception and locked states | §4 | 6 / B17 |  | Planned |  |
| REQ-OFF-005 | Server-received time authoritative; device time and sequence detect skew and reordering | §4 | 6 / B17 |  | Planned |  |
| REQ-OFF-006 | No automatic upload after revocation; recovery follows counsel's procedure | §4, decision 38 | 6 / B17 |  | Planned |  |

## Moments, media and files

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-MOM-001 | Unified timeline of published notes, photos and videos per client | §4, §5 | 7d / B25 |  | Planned |  |
| REQ-MOM-002 | A Moment row exists only once published; drafts and pending uploads never appear | §4 | 7d / B25 |  | Planned |  |
| REQ-MOM-003 | Caption edits author-only with immutable caption versions | §4 | 7d / B25 |  | Planned |  |
| REQ-MOM-004 | Timeline ordered by care-occurred time, newest first, cursor paging | §4, decision 13 | 7d / B25 |  | Planned |  |
| REQ-MOM-005 | Visibility defaults to Internal; sharing and preservation need their own authorization | §4 | 7d / B25 |  | Planned |  |
| REQ-MOM-006 | One owner per file; a note's file cannot back a standalone Moment | §4 | 7d / B25 |  | Planned |  |
| REQ-MOM-007 | Timeline responses carry metadata and an access reference, never raw storage URLs | §4 | 7d / B25 |  | Planned |  |
| REQ-MOM-008 | Media removed from a note stays visible in history unless its clearance forbids it | §4, decision 15 | 7d / B25 |  | Planned |  |
| REQ-MED-001 | Capture first, resolve later; nothing prompts before capture | §4, decision 21 | 7b / B19 |  | Planned |  |
| REQ-MED-002 | Automatic authorization check after upload, tagging, authorization change and nightly | §4 | 7d / B23 |  | Planned |  |
| REQ-MED-003 | Protection from policy by person type; required blur locked and enforced on the server | §4 | 7b / B19 |  | Planned |  |
| REQ-MED-004 | Detection and tracking only, never face collections or matching | §4 | 7b / B19 |  | Planned |  |
| REQ-MED-005 | Blurring defaults to the whole person; face-only selectable | decision 18 | 7b / B19 |  | Planned |  |
| REQ-MED-006 | Re-rendering is unlimited; only the chosen version is publishable | decision 19 | 7b / B19 |  | Planned |  |
| REQ-MED-007 | Publication gate: scanned, cleared, rendered, quality-checked, reviewed, authorized, audio rule met | §4 | 7d / B23 |  | Planned |  |
| REQ-MED-008 | Leak controls: servable variant only for every channel, metadata stripped, no cacheable media | §4 | 7b / B19 |  | Planned |  |
| REQ-MED-009 | Clearance states with reviewer-only rejection, reversible until disposal, escalation at 7 days | §4 | 7d / B23 |  | Planned |  |
| REQ-MED-010 | Download only for staff with media.download and through evidence packages | §4, decision 17 | 7d / B23 |  | Planned |  |
| REQ-MED-011 | Audio on by default; Allowed, ReviewRequired or MuteRequired rules; review never deletes audio | §4 | 7b / B19 |  | Planned |  |
| REQ-MED-012 | Originals retained in the restricted zone and disposed of only when counsel allows | §4, decision 39 | 7d / B24 |  | Planned |  |
| REQ-MED-013 | One-tap publish after clearance; agency policy may enable automatic publishing | §4, decision 25 | 7d / B23 |  | Planned |  |
| REQ-MED-014 | Accessible editor, consent screens and dashboard (screen reader, no precise dragging) | §4 | 7b, 7c |  | Planned |  |
| REQ-MED-015 | Tenant isolation in workers: per-job storage session limited to the organization prefix | §4 | 7a / B18 |  | Planned |  |
| REQ-FILE-001 | Upload to private quarantine; validate type, size and metadata; scan; release only after both pass | §2, §4 | 7a / B18 |  | Planned |  |
| REQ-FILE-002 | Malware scanning fails closed; 60-second deadline; plain user messages | §2 | 7a / B18 |  | Planned |  |
| REQ-FILE-003 | Storage zones with separate keys; server-issued keys beginning with the organization ID | §2, §4 | 7a / B18 |  | Planned |  |
| REQ-FILE-004 | No ID substitution; a file ID alone never grants download | §4 | 7a / B18 |  | Planned |  |
| REQ-FILE-005 | Every download authorized and audited through a short-lived token | §2, §4 | 7a / B18 |  | Planned |  |
| REQ-FILE-006 | Media tokens 5 minutes, export links 24 hours, incomplete uploads expire after 24 hours | decision 31 | 7a / B18 |  | Planned |  |
| REQ-FILE-007 | Video through short-lived signed requests to servable variants only | decision 32 | 7b / B19 |  | Planned |  |
| REQ-FILE-008 | Abandoned uploads and orphaned objects cleaned up safely | §2 | 7a / B18 |  | Planned |  |

## Consent and authority

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-CONS-001 | Person-specific authorizations by purpose, media type, audio, restrictions, period and client scope | §4 | 7c / B20 |  | Planned |  |
| REQ-CONS-002 | 12-month default and V1 maximum; shorter periods win | §4, decision 24 | 7c / B20 |  | Planned |  |
| REQ-CONS-003 | Automatic reuse of a matching verified authorization | §4 | 7c / B20 |  | Planned |  |
| REQ-CONS-004 | AutoVerified only when properly authenticated; second review in listed cases | §4, decision 23 | 7c / B20 |  | Planned |  |
| REQ-CONS-005 | Status derived, never typed; immutable event history | §4 | 7c / B21 |  | Planned |  |
| REQ-CONS-006 | Expiring Soon at 30 days; reminders at 30 and 7 days with generic text | decision 22 | 7c / B21 |  | Planned |  |
| REQ-CONS-007 | Renewal reminders start with agency staff; renewal is affirmative | decision 26 | 7c / B21 |  | Planned |  |
| REQ-CONS-008 | Filter for recently auto-verified consents; no mandatory sampling | decision 28 | 7c / B21 |  | Planned |  |
| REQ-CONS-009 | Staff and caregivers can add people records; duplicates merged by hand within an organization | §4, decision 29 | 7c / B20 |  | Planned |  |
| REQ-CONS-010 | Withdrawal takes effect at once from any channel and is verified afterwards | §4 | 7c / B20 |  | Planned |  |
| REQ-CONS-011 | Media privacy policy versions: immutable, recorded on every evaluation | §4 | 7c / B20 |  | Planned |  |
| REQ-CONS-012 | Media Consent Dashboard: overview, list, person and authorization views, open items, requests | §4 | 7c / B21 |  | Planned |  |
| REQ-CONS-013 | Remote consent page: one purpose, 256-bit token, keyed hash, one-time code, strict CSP, rate limits, generic responses | §4 | 7c / B22 |  | Planned |  |
| REQ-CONS-014 | Separate authorizations for documentation, family sharing, family access and audio; none implies another | §4 | 7c / B20 |  | Planned |  |

## Requests, evidence, documents and reports

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-RR-001 | Requesters invited, sign in with MFA, see only their own requests and responses | §4 | 8 / B26 |  | Planned |  |
| REQ-RR-002 | Requests logged from every channel with received and logged dates kept apart | §4 | 8 / B26 |  | Planned |  |
| REQ-RR-003 | Workflow with append-only events and deadline rules configured with counsel | §4 | 8 / B26 |  | Planned |  |
| REQ-RR-004 | Correction statements attributed and immutable; notes never rewritten | §4 | 8 / B26 |  | Planned |  |
| REQ-EVD-001 | Service evidence packages with servable media and a manifest, delivered by audited short-lived link | §4, decision 41 | 8 / B27 |  | Planned |  |
| REQ-EVD-002 | External reviewer read-only timeline within a verified, time-limited grant | §4, decision 41 | 8 / B27 |  | Planned |  |
| REQ-EVD-003 | Evidence-grade provenance: source, times, uploader, checksums, basis | §4 | 7b, 8 |  | Planned |  |
| REQ-DOC-001 | Documents by client; caregivers read assigned; administrators read all, upload, manage; no versioning in V1 | §4, decision 62 | 8 / B28 |  | Planned |  |
| REQ-RPT-001 | Reports for hours, timesheets, assignments, documentation completion, Moments activity and operations | §4 | 8 / B30 |  | Planned |  |
| REQ-RPT-002 | PDF, CSV and Excel exports with formula neutralization, short-lived audited downloads | §4 | 8 / B30 |  | Planned |  |
| REQ-RPT-003 | A shift is documented when a note is published within 24 hours of the shift end | decision 11 | 8 / B30 |  | Planned |  |
| REQ-RPT-004 | Reports never include diagnoses or alert text without the clinical permission | §4 | 8 / B30 |  | Planned |  |

## Notifications

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-NOTIF-001 | Push carries only an opaque routing token and one fixed generic text | §9, decision 107 | 8 / B29 |  | Planned |  |
| REQ-NOTIF-002 | Opening a notification re-authorizes the target; failures show a generic message | §4, §9 | 8 / B29 |  | Planned |  |
| REQ-NOTIF-003 | Codes and links never sent by push | §9 | 8 / B29 |  | Planned |  |
| REQ-NOTIF-004 | Notifications and Needs attention cards use inherited authorization | decision 96 | 8 / B29 |  | Planned |  |

## Organization lifecycle and platform operations

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-OFFB-001 | Cancellation starts offboarding with a 60-day export window and two named custodians | §4 | 9 / B31 |  | Planned |  |
| REQ-OFFB-002 | Comprehensive structured export with manifest and checksums | §4 | 9 / B31 |  | Planned |  |
| REQ-OFFB-003 | Disposal only after retention, holds, contracts and explicit approval, leaving a minimal record | §4 | 9 / B31 |  | Planned |  |
| REQ-OFFB-004 | Legal holds placed and lifted with a reason | §4, §6 | 9 / B32 |  | Planned |  |
| REQ-SUP-001 | No standing Kindred access; platform-support tables ship at launch | §4, decision 37 | 9 / B33 |  | Planned |  |
| REQ-SUP-002 | Support grants need agency approval and a separate Kindred security approver, one hour by default | §4 | 9 / B33 |  | Planned |  |
| REQ-SUP-003 | Every support action audited with the grant ID; parties notified | §4 | 9 / B33 |  | Planned |  |
| REQ-SUP-004 | Emergency access: eligibility criteria, 30-minute expiry, independent review within 24 hours | §4, decision 34 | 9 / B33 |  | Planned |  |
| REQ-SUP-005 | Grants set the database context to the granted organization only; no bypass | §4 | 9 / B33 |  | Planned |  |
| REQ-OPS-001 | RPO 15 minutes and RTO 4 hours for component and zone failures; Region-wide target later | §2, decision 40 | 9, 11 / B34 |  | Planned |  |
| REQ-OPS-002 | Restore drills before launch and every six months, with validation after restore | §2, decision 33 | 9, 11 / B34 |  | Planned |  |
| REQ-OPS-003 | Written runbooks and a named recovery owner; monitoring of backups and replication | §2 | 9 / B34 |  | Planned |  |

## Navigation (Section 5)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-NAV-001 | Auth flow: Splash, Log In, Forgot your password, reset, MFA, workspace resolution | §5 | 2, 3 |  | Planned |  |
| REQ-NAV-002 | Five tabs for caregiver (Home, Clients, Moments, Kindu, Profile) and organization (Home, Clients, Schedule, Caregivers, More) | §5 | 3 / B6 |  | Planned |  |
| REQ-NAV-003 | Care content always inside one client, except the limited Home preview | §5 | 3 / B6 |  | Planned |  |
| REQ-NAV-004 | Hiding is a convenience; a deep link without access shows a plain no-access screen | §5 | 3 / B6 |  | Planned |  |
| REQ-NAV-005 | Moments tab entry rule: one client opens directly, several show a picker, none shows an empty state | §5, decision 50 | 7d / B25 |  | Planned |  |
| REQ-NAV-006 | Timeline shows only published and cleared items, with an author-only In progress strip and N waiting chip | §5, decisions 51 and 66 | 7d / B25 |  | Planned |  |
| REQ-NAV-007 | Add Care Note and Add Photo/Video buttons shown only with the create permission | §5, decision 49 | 7d / B25 |  | Planned |  |
| REQ-NAV-008 | Home Recent Moments: up to 10 items from 7 days, each naming and opening its client | §5, decision 48 | 7d / B25 |  | Planned |  |
| REQ-NAV-009 | Seven plain media labels for caregivers | §5, decision 52 | 7d / B23 |  | Planned |  |
| REQ-NAV-010 | Organization Home shows at most five permission-gated Needs attention cards | §5, decision 53 | 8 / B29 |  | Planned |  |
| REQ-NAV-011 | More is a searchable list in six permission-gated groups | §5, decision 53 | 3 / B6 |  | Planned |  |
| REQ-NAV-012 | Notes oversight replaces any care-note review destination | §5, decision 54 | 6 / B15 |  | Planned |  |
| REQ-NAV-013 | Caregivers reach consent only inside the media flow and the profile overflow | §5, decision 55 | 7c / B20 |  | Planned |  |
| REQ-NAV-014 | Brand Foundation product language in UI copy (Organization, Caregiver, Time, Documents) | §1 obs. 3, decision 2 | 3 / B6 |  | Planned |  |
| REQ-NAV-015 | Limited workspaces without tabs for reviewer, requester, external reviewer and export custodian | §5, decision 56 | 3, 8, 9 |  | Planned |  |
| REQ-NAV-016 | Time-aware greeting | §1 obs. 8 | 3 / B6 |  | Planned |  |
| REQ-NAV-017 | Workspace switcher in the drawer and Profile; one login | §3, §5 | 2 / B2 |  | Planned |  |

## Feature matrix release rules (Section 7)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-FM-001 | The matrix is the release gate; V1 ships full mobile functionality; web only at parity | §7 rule 1 | All | `docs/architecture/feature-matrix.md` | Planned |  |
| REQ-FM-002 | Every row is testable against the Section 6 catalog | §7 rule 2 | 1 / B1 | `check-feature-matrix.mjs`; ADR 0027 | Implemented | check-feature-matrix.test.mjs |
| REQ-FM-003 | A row ships only when its permissions, navigation and Appendix C scenarios exist | §7 rule 3 | All |  | Planned |  |
| REQ-FM-004 | Feature flags never grant access | §7 rule 4, decision 84 | 2+ |  | Planned |  |
| REQ-FM-005 | Hidden is not secured: the server enforces every rule | §7 rule 5 | All |  | Planned |  |
| REQ-FM-006 | Deferred rows stay deferred | §7 rule 6 | All |  | Planned |  |

## Kindu

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-KINDU-001 | Kindu Coming Soon screen gated by kindu.use; no AI content | §2, §7, decision 87 | 10 / B35 |  | Planned |  |
| REQ-KINDU-002 | IKinduProvider with a placeholder that the API refuses to start with in production | §2 | 10 / B35 |  | Planned |  |

## Security and compliance (Section 9)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-SECC-001 | No compliance claim on technical controls alone; none for HIPAA, Medicaid, EVV or certifications until verified | §9, decision 98 | All |  | Planned |  |
| REQ-SECC-002 | Minimum necessary; client details never in logs, crash reports, push, URLs, analytics or search indexes | §9 | All |  | Planned |  |
| REQ-SECC-003 | Only selected and verified services process real client data; unverified optional services denied by account policy | §9, decisions 106 and 118 | 2, 7 |  | Planned |  |
| REQ-SECC-004 | Android sensitive screens block screenshots and recording; iOS hides content in the switcher and while recording | §9, decision 99 | 3+ |  | Planned |  |
| REQ-SECC-005 | Device integrity attestation with three outcomes, verified by the server | §9, decisions 104 and 105 | 5, 6 |  | Planned |  |
| REQ-SECC-006 | Platform TLS validation, no certificate pinning in V1 | §9, decision 99 | 2+ |  | Planned |  |
| REQ-SECC-007 | No error monitoring or analytics receives client data in V1 | §9, decision 100 | All |  | Planned |  |
| REQ-SECC-008 | Written incident plan before real data; alarms; containment; counsel on notification | §9, decision 101 | 9, 11 |  | Planned |  |
| REQ-SECC-009 | External penetration test before launch and after remediation; dependency inventory per release | §9, decision 103 | 11 / B36 |  | Planned |  |
| REQ-SECC-010 | Legal and compliance release matrix completed before real data or launch | §9, decisions 94 and 102 | G2, G4 |  | Planned |  |
| REQ-SECC-011 | Policy-dependent behaviour ships as versioned settings | §8, decision 92 | 7c+ |  | Planned |  |
| REQ-SECC-012 | WCAG 2.2 AA accessibility, audited in Phase 11 | §9, decision 43 | 11 / B36 |  | Planned |  |

## Gates and spikes (Section 8)

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-GATE-001 | G1 security gate: generated matrix and lifecycle tests pass against real PostgreSQL before Phase 3 | §8, §6a | End of 2 |  | Planned |  |
| REQ-GATE-002 | G2 media protection gate before any real client media; founder confirms after the report | §8, decisions 95 and 116 | Before real media |  | Planned |  |
| REQ-GATE-003 | G3 isolation regression at every phase end | §8 | Every phase |  | Planned |  |
| REQ-GATE-004 | G4 launch gate: every Appendix C scenario, pen test, restore drills, accessibility and legal items complete | §8 | End of 11 |  | Planned |  |
| REQ-SPIKE-001 | S1 video protection benchmark | §8 | 1 in parallel |  | Planned |  |
| REQ-SPIKE-002 | S2 KMS audit-write load test | §8 | 2 |  | Planned |  |
| REQ-SPIKE-003 | S3 encrypted local store and hardware-backed keys in Expo | §8 | 3 |  | Planned |  |
| REQ-SPIKE-004 | S4 SES production access and text sender registration | §8 | 2 |  | Planned |  |
| REQ-SPIKE-005 | S5 library import behaviour on iOS and Android | §8 | 3 |  | Planned |  |
| REQ-SPIKE-006 | S6 Rekognition limits and throttling | §8 | 2 |  | Planned |  |
| REQ-SPIKE-008 | S8 Cognito multi-Region behaviour with authenticator-app MFA | §8 | 2 |  | Planned |  |
| REQ-SPIKE-007 | S7 RDS extensions and PostgreSQL version, and proof that branch protection is enforced | §8, §10 | 1 / B1 | ADRs 0016, 0019 | Verified | docs/architecture/adr/evidence/0016-enforcement.md; docs/acceptance/m1/c13-postgres.json |

## Acceptance scenarios (Appendix C)

Every scenario runs against the real API and a real PostgreSQL database, and each denial also checks
that an audit event was written and that no restricted data appears in the response. IDs keep the
Appendix C numbering.

### N series: Care notes

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-N1 | Another assigned caregiver edits a published note: denied | App. C N1 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N2 | An administrator edits a note they did not author: denied | App. C N2 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N3 | An administrator publishes or edits a draft for the author: denied | App. C N3 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N4 | An author with a suspended or deactivated membership edits or publishes: denied | App. C N4 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N5 | An author inside the 48-hour grace edits, finishes a draft or adds a late entry: allowed with basis DocumentationGrace | App. C N5 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N6 | An author inside the grace opens the profile or another's note, or documents outside assigned dates: denied | App. C N6 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N7 | After grace expiry or revocation the author edits or publishes: denied until an exception exists | App. C N7 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N8 | An exception approved by the author themselves: rejected | App. C N8 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N9 | An exception that lets someone other than the author edit: rejected | App. C N9 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N10 | A reinstated membership edits without new assignments: denied | App. C N10 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N11 | Autosave ten times: zero versions, published content unchanged | App. C N11 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N12 | Two devices save the same draft revision: the second gets 409 | App. C N12 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N13 | Publish repeated with the same key: one version and one timeline entry | App. C N13 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N14 | Publish while attached media is pending: version 1 holds only cleared media; pending files stay private | App. C N14 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N15 | Wrong-client report: hidden at once everywhere; original unchanged; case opens | App. C N15 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N16 | Dismissed or resolved case: visibility restored or replacement linked; audit complete | App. C N16 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N17 | An administrator reads a draft or sealed draft: denied; indicator shows metadata only | App. C N17 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N18 | Update or delete a version row as the application role: fails | App. C N18 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N19 | Pending media clears and the author attaches it: version N+1; version 1 and author unchanged | App. C N19 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N20 | Others request a pending file: nothing is returned, not even a count | App. C N20 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N21 | Someone other than the author attaches cleared media: denied | App. C N21 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N22 | The author loses authorization before media clears: no one can attach; disposition without reading | App. C N22 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N23 | Attach repeated or against a stale base version: one version, then 409 | App. C N23 | 6 / B14-B16, B25 |  | Planned |  |
| REQ-ACC-N24 | A pending, restricted, rejected or held file is attached: rejected by the server and the trigger | App. C N24 | 6 / B14-B16, B25 |  | Planned |  |

### M series: Moments

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-M1 | Care-note photos appear inside one timeline entry | App. C M1 | 7d / B25 |  | Planned |  |
| REQ-ACC-M2 | Publish a caption without media: rejected | App. C M2 | 7d / B25 |  | Planned |  |
| REQ-ACC-M3 | Attach a note's file to a standalone Moment: rejected by the one-owner rule | App. C M3 | 7d / B25 |  | Planned |  |
| REQ-ACC-M4 | Publish media while Pending, Restricted or Rejected: denied | App. C M4 | 7d / B25 |  | Planned |  |
| REQ-ACC-M5 | A reviewer clears their own upload: denied | App. C M5 | 7d / B25 |  | Planned |  |
| REQ-ACC-M6 | A pending item reaches seven days: escalated, never published or deleted automatically | App. C M6 | 7d / B25 |  | Planned |  |
| REQ-ACC-M7 | Documentation-only clearance used for family sharing: denied | App. C M7 | 7d / B25 |  | Planned |  |
| REQ-ACC-M8 | Media with a derivative requested as original, thumbnail, preview or download: only the derivative | App. C M8 | 7d / B25 |  | Planned |  |
| REQ-ACC-M9 | A file ID from another organization is attached: rejected by the composite key | App. C M9 | 7d / B25 |  | Planned |  |
| REQ-ACC-M10 | Family sharing withdrawn: access ends on the next request; legal-access path remains | App. C M10 | 7d / B25 |  | Planned |  |
| REQ-ACC-M11 | Media requested after consent revocation with an old token: denied | App. C M11 | 7d / B25 |  | Planned |  |

### R series: Rights requests

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-R1 | A requester reads another client's record or request: denied | App. C R1 | 8 / B26 |  | Planned |  |
| REQ-ACC-R2 | A representative without the covering action requests an amendment: cannot be fulfilled | App. C R2 | 8 / B26 |  | Planned |  |
| REQ-ACC-R3 | An externally received request stores received and logged dates separately | App. C R3 | 8 / B26 |  | Planned |  |
| REQ-ACC-R4 | A correction statement leaves the note and versions unchanged and shows its author | App. C R4 | 8 / B26 |  | Planned |  |
| REQ-ACC-R5 | A requester signs up without an invitation: impossible | App. C R5 | 8 / B26 |  | Planned |  |

### A series: Authority and alerts

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-A1 | A parent-based authority reaches its transition date: actions end, services continue, task opens, 90-day notice sent | App. C A1 | 4 / B7, B10 |  | Planned |  |
| REQ-ACC-A2 | Diagnoses requested without the clinical permission in lists, search, exports or notifications: never returned | App. C A2 | 4 / B7, B10 |  | Planned |  |
| REQ-ACC-A3 | An alert passes its review date: shown as needing review and reported | App. C A3 | 4 / B7, B10 |  | Planned |  |

### X series: Reports and offboarding

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-X1 | A report viewed without export permission: export denied | App. C X1 | 8, 9 / B30, B31 |  | Planned |  |
| REQ-ACC-X2 | A report cell beginning with =, +, - or @: neutralized in CSV and Excel | App. C X2 | 8, 9 / B30, B31 |  | Planned |  |
| REQ-ACC-X3 | A report containing another organization's data: impossible | App. C X3 | 8, 9 / B30, B31 |  | Planned |  |
| REQ-ACC-X4 | Nonpayment suspension: no disposal; reactivation restores access | App. C X4 | 8, 9 / B30, B31 |  | Planned |  |
| REQ-ACC-X5 | Offboarding export: named custodians with MFA within 60 days; manifest and checksums; audited | App. C X5 | 8, 9 / B30, B31 |  | Planned |  |

### O series: Offline

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-O1 | Offline draft syncs with valid authorization: private draft, never published | App. C O1 | 6 / B17 |  | Planned |  |
| REQ-ACC-O2 | Sync after grace expiry: held until an approved exception | App. C O2 | 6 / B17 |  | Planned |  |
| REQ-ACC-O3 | Sync after membership revocation: refused, store locked, nothing lost silently | App. C O3 | 6 / B17 |  | Planned |  |
| REQ-ACC-O4 | Sync retried after a failed upload: one draft | App. C O4 | 6 / B17 |  | Planned |  |
| REQ-ACC-O5 | Conflicting server revision: conflict state, nothing overwritten | App. C O5 | 6 / B17 |  | Planned |  |
| REQ-ACC-O6 | Offline until the lease lapses: store locked until sign-in and renewal | App. C O6 | 6 / B17 |  | Planned |  |
| REQ-ACC-O7 | Device marked lost: wipe requested; store unreadable after lease lapse | App. C O7 | 6 / B17 |  | Planned |  |
| REQ-ACC-O8 | Device clock set backward: server time governs; skew flagged | App. C O8 | 6 / B17 |  | Planned |  |
| REQ-ACC-O9 | Logout with unsynchronized drafts: three choices offered | App. C O9 | 6 / B17 |  | Planned |  |

### S series: Support access

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-S1 | Support access without both approvals or self-approved: not granted | App. C S1 | 9 / B33 |  | Planned |  |
| REQ-ACC-S2 | A support grant past one hour or outside its scope: denied | App. C S2 | 9 / B33 |  | Planned |  |
| REQ-ACC-S3 | An ordinary issue submitted as an emergency: fails eligibility, flagged | App. C S3 | 9 / B33 |  | Planned |  |
| REQ-ACC-S4 | Any platform access across two organizations: impossible | App. C S4 | 9 / B33 |  | Planned |  |

### D series: Recovery

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-D1 | Restore drill: integrity, audit-chain, media checksums and reconciliation pass within targets | App. C D1 | 9, 11 / B34 |  | Planned |  |

### P series: Media protection

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-P1 | Blurring switched off for a person whose decision must be Blurred: rejected by the server | App. C P1 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P2 | A refused, withdrawn or protected person set to Visible: rejected | App. C P2 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P3 | An untagged person in a video: Check these moments markers, publishing held, work preserved | App. C P3 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P4 | Group media with every friend authorized and Visible: published with no blur | App. C P4 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P5 | Group media with one unauthorized person needing protection: only that person protected | App. C P5 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P6 | Benchmark footage with moving subjects: selected people obscured within the threshold | App. C P6 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P7 | A background region blurred: region obscured, primary client visible | App. C P7 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P8 | Every rendition of a protected video: only derivatives; nothing else from the original | App. C P8 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P9 | A transcode, poster or thumbnail job with the original as input: rejected by the trigger | App. C P9 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P10 | Publish before render, check, review and consents succeed: denied; original never a fallback | App. C P10 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P11 | A reviewer clears media they uploaded: denied | App. C P11 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P12 | Preview, adjust, re-render and choose: only the chosen version is publishable | App. C P12 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P13 | The same media as standalone and as note media: identical gates, one owner | App. C P13 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P14 | Another organization's file, subject, job or storage prefix: rejected | App. C P14 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P15 | Audio default, then ReviewRequired and MuteRequired rules: on by default; held; enforced and locked | App. C P15 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P16 | A consent needing second review, self-verified, or signup terms only: does not count | App. C P16 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P17 | Consent revoked then media requested with an old token: denied | App. C P17 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P18 | A non-custodian and a custodian request an original: denied; allowed and audited | App. C P18 | 7b, 7d / B19, B23, B24 |  | Planned |  |
| REQ-ACC-P19 | After a confirmed upload: device copies deleted; library original untouched; no face collection | App. C P19 | 7b, 7d / B19, B23, B24 |  | Planned |  |

### K series: Consent

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-K1 | A valid authorization covers the person and use: reused automatically with no prompt | App. C K1 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K2 | An expired authorization at capture: capture not blocked; held; re-evaluated after renewal | App. C K2 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K3 | An authorization over 12 months or the policy maximum: rejected; shorter wins | App. C K3 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K4 | Authority ends or a minor reaches transition: dependent authorizations end; re-evaluation | App. C K4 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K5 | A withdrawal is recorded: effective immediately; tokens fail; documentation retained | App. C K5 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K6 | A mistaken withdrawal: reversible only with a documented reason; both audited | App. C K6 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K7 | Routine adult in-app consent AutoVerified; representative or minor pending second review | App. C K7 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K8 | The recorder tries to give the second review: denied | App. C K8 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K9 | Dashboard statuses across boundaries and time zones are always correct and derived | App. C K9 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K10 | Renewal reminders: one per lead time, none after withdrawal or renewal, generic text | App. C K10 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K11 | Another organization or a caregiver without permission requests dashboard data: nothing returned | App. C K11 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K12 | The application role updates or deletes an authorization or event: fails | App. C K12 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K13 | An authorization due for renewal never renews silently | App. C K13 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K14 | A documentation authorization is not reused for sharing or audio it does not cover | App. C K14 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K15 | Group video: only the unauthorized other client is protected | App. C K15 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K16 | Detection fails or is uncertain: editor works manually; no rejection | App. C K16 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K17 | A system failure never sets Rejected; only a reviewer does, reversibly | App. C K17 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K18 | A long or large video is processed in segments with no limit imposed for cost | App. C K18 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K19 | Duplicate people records merged by hand in one organization; never matched across organizations | App. C K19 | 7c, 7d / B20-B23 |  | Planned |  |
| REQ-ACC-K20 | A held item unresolved after seven days: escalated; never published or deleted automatically | App. C K20 | 7c, 7d / B20-B23 |  | Planned |  |

### E series: Evidence and reviewers

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-E1 | A reviewer requests anything outside their grant: nothing returned | App. C E1 | 8 / B27 |  | Planned |  |
| REQ-ACC-E2 | A reviewer's grant revoked or expired mid-session: denied on the next request | App. C E2 | 8 / B27 |  | Planned |  |
| REQ-ACC-E3 | A reviewer searches, downloads media or opens an original: denied | App. C E3 | 8 / B27 |  | Planned |  |
| REQ-ACC-E4 | An evidence package contains only servable variants and a manifest; short-lived audited link | App. C E4 | 8 / B27 |  | Planned |  |
| REQ-ACC-E5 | Care-operations basis supports documentation and review; family sharing blocked without consent | App. C E5 | 8 / B27 |  | Planned |  |
| REQ-ACC-E6 | Every reviewer view and package download is audited | App. C E6 | 8 / B27 |  | Planned |  |

### I series: Library import

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-I1 | Imported photo and video pass the same gates as captured media | App. C I1 | 7b / B19 |  | Planned |  |
| REQ-ACC-I2 | Captured and imported copies of a file: identical gates; only the source differs | App. C I2 | 7b / B19 |  | Planned |  |
| REQ-ACC-I3 | Imported device dates and location: unverified, never used, never in servable files | App. C I3 | 7b / B19 |  | Planned |  |
| REQ-ACC-I4 | Imported infected, protected, unsupported or inconclusive files: isolated or rejected plainly | App. C I4 | 7b / B19 |  | Planned |  |
| REQ-ACC-I5 | Import without assignment, grace or exception: denied | App. C I5 | 7b / B19 |  | Planned |  |
| REQ-ACC-I6 | Import cancelled or app closed mid-way: no orphans; safely resumable | App. C I6 | 7b / B19 |  | Planned |  |
| REQ-ACC-I7 | After a confirmed import upload: Kindred copies deleted; library original untouched | App. C I7 | 7b / B19 |  | Planned |  |
| REQ-ACC-I8 | Evidence package with an imported file shows the source and unverified times | App. C I8 | 7b / B19 |  | Planned |  |

### L series: Remote consent links

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-L1 | A link to a staff-confirmed adult completes as AutoVerified and is reused | App. C L1 | 7c / B22 |  | Planned |  |
| REQ-ACC-L2 | Expired, used, revoked, altered or unknown links: one generic response; audited | App. C L2 | 7c / B22 |  | Planned |  |
| REQ-ACC-L3 | Five wrong codes: link locks, staff notified, nothing created | App. C L3 | 7c / B22 |  | Planned |  |
| REQ-ACC-L4 | A link used for another purpose, person, client or wider scope: impossible | App. C L4 | 7c / B22 |  | Planned |  |
| REQ-ACC-L5 | Verified representative AutoVerified; unverified representative pending second review | App. C L5 | 7c / B22 |  | Planned |  |
| REQ-ACC-L6 | A minor signer or an unconfirmed contact: Pending Verification with a reason | App. C L6 | 7c / B22 |  | Planned |  |
| REQ-ACC-L7 | A renewal link used to widen scope or exceed the maximum: rejected | App. C L7 | 7c / B22 |  | Planned |  |
| REQ-ACC-L8 | A withdrawal through a link: effective at once; verification follows | App. C L8 | 7c / B22 |  | Planned |  |
| REQ-ACC-L9 | Page, responses and logs show only the one authorization; no third-party scripts; token never logged | App. C L9 | 7c / B22 |  | Planned |  |
| REQ-ACC-L10 | Many link or code requests: rate limited, audited, staff alerted | App. C L10 | 7c / B22 |  | Planned |  |
| REQ-ACC-L11 | A link revoked, or its record archived, authority ended or request cancelled: stops working | App. C L11 | 7c / B22 |  | Planned |  |
| REQ-ACC-L12 | Another organization or an unauthorized caregiver issues, lists or revokes a link: denied | App. C L12 | 7c / B22 |  | Planned |  |
| REQ-ACC-L13 | Architecture tests: public consent routes reference only ConsentLinks | App. C L13 | 7c / B22 |  | Planned |  |
| REQ-ACC-L14 | The code never arrives for a withdrawal: staff can record it by any channel | App. C L14 | 7c / B22 |  | Planned |  |

### T series: Access lifecycle and separation

| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-ACC-T1 | An administrator creates, publishes, edits or attaches note media, or acts as another user: denied | App. C T1 | 2-9 |  | Planned |  |
| REQ-ACC-T2 | An administrator requests a draft or sealed draft body: denied; indicator only | App. C T2 | 2-9 |  | Planned |  |
| REQ-ACC-T3 | Restricted original: administrator denied, custodian without step-up denied, with step-up allowed | App. C T3 | 2-9 |  | Planned |  |
| REQ-ACC-T4 | Held media decided by administrator (denied), reviewer (allowed), reviewer-uploader (denied) | App. C T4 | 2-9 |  | Planned |  |
| REQ-ACC-T5 | Offboarding export by administrator, custodian without window, custodian in window | App. C T5 | 2-9 |  | Planned |  |
| REQ-ACC-T6 | Every role requests another organization's resource: not found; RLS returns no rows | App. C T6 | 2-9 |  | Planned |  |
| REQ-ACC-T7 | Assignment ends with a draft, then grace revoked: reading stops; publishing only under grace or exception | App. C T7 | 2-9 |  | Planned |  |
| REQ-ACC-T8 | Consent withdrawn while media is queued, held, on another device or a link is open | App. C T8 | 2-9 |  | Planned |  |
| REQ-ACC-T9 | A device syncs queued actions after access ends or a wipe: each rechecked; drafts never auto-publish | App. C T9 | 2-9 |  | Planned |  |
| REQ-ACC-T10 | An external reviewer outside grant, after expiry, or for pending files or originals: denied | App. C T10 | 2-9 |  | Planned |  |
| REQ-ACC-T11 | Designation assignment without permission, step-up or to oneself: denied as specified | App. C T11 | 2-9 |  | Planned |  |
| REQ-ACC-T12 | Self-approval of hours, exceptions or a support grant: denied | App. C T12 | 2-9 |  | Planned |  |
| REQ-ACC-T13 | The generated matrix runs every permission as every role; an undeclared endpoint fails the build | App. C T13 | 1 (deny part), 2 (matrix) | Default deny; ADR 0020 | Partial | EndpointDeclarationTests; DefaultDenyTests; CI probe PR #3 (docs/acceptance/m1/github-ci-evidence.md). Generated matrix arrives in Phase 2 |
| REQ-ACC-T14 | A caregiver removed during an open shift: next request denied; ExceptionRaised; resolved with shifts.adjust | App. C T14 | 2-9 |  | Planned |  |
| REQ-ACC-T15 | A remote signer or requester calls any other route or reuses an expired link: denied | App. C T15 | 2-9 |  | Planned |  |
| REQ-ACC-T16 | Removing the last administrator or granting a permission one lacks: refused | App. C T16 | 2-9 |  | Planned |  |
| REQ-ACC-T17 | Solo agency starts offboarding: passkey, security identity check, 24-hour hold, step-up | App. C T17 | 2-9 |  | Planned |  |
| REQ-ACC-T18 | Solo export without identity check, before hold ends, after cancel or recent contact change: denied or paused | App. C T18 | 2-9 |  | Planned |  |
| REQ-ACC-T19 | An eligible second person exists or joins: two custodians required; solo refused | App. C T19 | 2-9 |  | Planned |  |
| REQ-ACC-T20 | Solo owner uploads media needing review: own review refused; reviewer unavailable; note still publishes | App. C T20 | 2-9 |  | Planned |  |
| REQ-ACC-T21 | Held file at seven days with no reviewer: escalated; Keep held, Restrict or Reject; no Clear | App. C T21 | 2-9 |  | Planned |  |
| REQ-ACC-T22 | Outside reviewer-only member: decides held files; everything else denied; access ends with designation | App. C T22 | 2-9 |  | Planned |  |
| REQ-ACC-T23 | Keep held renewed to 90 days: re-escalates; audited; reminders; flagged at 90 days | App. C T23 | 2-9 |  | Planned |  |
| REQ-ACC-T24 | Held item at its retention date or under legal hold: retention not extended by Keep held | App. C T24 | 2-9 |  | Planned |  |
| REQ-ACC-T25 | Inconclusive device integrity then seven days: online continues; no lease; step-up; administrator told | App. C T25 | 2-9 |  | Planned |  |
| REQ-ACC-T26 | Confirmed compromised device: client data denied; tokens and lease revoked; store locked | App. C T26 | 2-9 |  | Planned |  |
| REQ-ACC-T27 | Recovery from a Restricted device: no override; forged results rejected; new attestation required | App. C T27 | 2-9 |  | Planned |  |
| REQ-ACC-T28 | An unselected service invoked with real data: denied by account policy; pipeline works without it | App. C T28 | 2-9 |  | Planned |  |
| REQ-ACC-T29 | Every notification payload: opaque token and generic text; misuse returns only a generic message | App. C T29 | 2-9 |  | Planned |  |

