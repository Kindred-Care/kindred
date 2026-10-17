# 0024. Development script safeguards and synthetic-only seed data

- Status: Accepted (implemented in Milestone 1)
- Date: 2026-10-17
- Source: Section 3 Refinement 4 and follow-up decisions, Section 9 environments, Section 10 criterion 14

## Decision

Every development and seed script calls `assertLocal()` (`scripts/dev/lib/local-guard.mjs`) first and
refuses, with exit code 2, unless:

- `KINDRED_ENVIRONMENT` is exactly `Local`;
- every database host it would touch is on `scripts/dev/allowlist.json` (`localhost`, `127.0.0.1`, `::1`,
  `db`, `host.docker.internal`);
- no AWS credential variable is present for an account not on the allowlist (the allowlist is empty in
  Milestone 1).

There is no override flag. Destructive scripts (`npm run db:reset`) also require the exact typed phrase.
Production credentials are never stored on development machines.

The seed (`npm run seed`) generates people with invented surnames, RFC 2606 example domains,
555-0100 to 555-0199 phone numbers and generated initials as avatars, and validates the whole dataset
before writing it; anything that looks real is refused. Milestone 1 has no feature tables, so it writes
`scripts/seed/out/seed.json`; from Phase 2 it inserts the same data. Figma mockup photographs and real
client photographs never enter the repository: `repo-checks` allows images only in the placeholder
folders.

## Evidence

`local-guard.test.mjs` and `synthetic.test.mjs` run in the `repo-checks` CI job, including running the
real seed and reset scripts with `KINDRED_ENVIRONMENT=Production` and asserting they exit 2.
