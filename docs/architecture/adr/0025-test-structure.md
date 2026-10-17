# 0025. Three .NET test projects, Testcontainers and a security trait

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3 Refinement 3 and follow-up decisions, Section 8 testing, Appendix C preamble

## Decision

- `Kindred.UnitTests` (no I/O), `Kindred.IntegrationTests` (the real API in memory against a real
  PostgreSQL 18 container through Testcontainers, bootstrapped with the same role script as docker
  compose) and `Kindred.ArchitectureTests`, on xUnit v3 and the Microsoft Testing Platform.
- Tests in the required security categories carry `[Trait("Category", "Security")]`. CI runs them as
  their own required check (`security-tests`) and excludes them from `test-integration` and
  `test-architecture`, so they are reported separately.
- Test names carry the requirement ID (`REQ_SEC_001_...` in C#, `'REQ-SEC-001 ...'` in JavaScript).
  `scripts/dev/check-traceability.mjs` fails CI when a requirement marked Implemented has no test.
- Mobile tests use Jest with `jest-expo` and React Native Testing Library 14.
- Tests are reported as passing only when they actually ran; CI uploads TRX results.
