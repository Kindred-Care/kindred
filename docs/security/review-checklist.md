# Pull request review checklist

Section 3 sets zero required human approvals while Kindred has one developer. The required CI checks
and this checklist do the gatekeeping until a second developer joins. The author works through it for
every pull request and ticks the summary box in the pull request template.

High-risk changes also need **independent review before production deployment**. Independent means
someone other than the author. Who provides that review (a second developer or an outside security
reviewer) is still an open decision (Section 3 follow-up decisions).

## Every pull request

- [ ] The change is in scope for the current milestone or phase and traces to requirement IDs in
      [traceability.md](../product/traceability.md).
- [ ] Every new or changed behaviour has a test, and tests carry the requirement ID in their name or
      trait.
- [ ] Only tests that actually ran are claimed in the description.
- [ ] No secrets, tokens, keys, connection strings with real passwords or `.env` files are committed.
      The pre-commit gitleaks hook ran (`git config core.hooksPath` prints `.githooks`).
- [ ] Synthetic data only. No real client information, and no Figma mockup or client photographs, in
      code, seed data, tests, fixtures, screenshots or demonstrations.
- [ ] No client details in logs, error messages, URLs, crash reports or analytics (Section 9,
      principle 3).
- [ ] New dependencies are justified, pinned by the lockfile, and pass the dependency scan.

## Backend

- [ ] Every new endpoint declares its required permission, or is explicitly public with a reason. Health
      is the only public endpoint in Milestone 1 (Section 6a, default deny).
- [ ] Controllers contain no authorization logic of their own and do not use the database context
      directly.
- [ ] Domain references no Infrastructure, EF Core, Npgsql or AWS code. Application does not reference
      Infrastructure or Api.
- [ ] Errors use the standard problem-details response, with no stack traces, SQL or internal
      identifiers in the body.
- [ ] Mutating operations are idempotent where Section 2 requires it, and use the concurrency
      convention.

## Contract

- [ ] `docs/api/openapi.json` and `apps/mobile/src/api/generated/` were regenerated with
      `npm run codegen` and committed. Nothing in `generated/` was edited by hand.
- [ ] A breaking change is intentional, versioned, and labelled `contract:breaking-approved` with the
      reason in the description.

## Database and migrations

- [ ] Migrations are code-first, the generated SQL was reviewed, and they run under the migration role,
      never at application start-up.
- [ ] Destructive changes (drops, narrowing type changes, data rewrites) are labelled, have a
      forward-recovery plan, and touch no security table without independent review.
- [ ] The application role gains no schema-change privileges.

## Mobile

- [ ] Colours, spacing and type come from generated tokens. No inline hex values.
- [ ] Interactive elements have accessibility labels and roles, and text scales with dynamic type.
- [ ] No sensitive data is persisted outside secure storage. The query cache stays in memory.

## High-risk areas (independent review before production)

Authentication, authorization and permissions, the audit chain, tenant isolation (Row-Level Security
and query filters), file upload and scanning, infrastructure, CI workflows, and migrations touching any
of those. If the change touches one:

- [ ] It is listed in the pull request description under "High-risk areas touched".
- [ ] The security-trait test suite covers the change and passes.
- [ ] An ADR records any new or changed control.
