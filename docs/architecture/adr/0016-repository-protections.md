# 0016. GitHub Team ruleset protecting main, and its enforcement proof

- Status: Accepted, verification pending (the enforcement results below are filled in when the tests run)
- Date: 2026-10-17
- Source: Section 3 Refinement 4 and follow-up decisions, Section 9 secure development, Section 10
  criteria 8 and 9; decisions 109 and 114

## Context

Section 3 requires `main` to accept changes only through pull requests with required, up-to-date status
checks, no direct pushes, no force pushes, no branch deletion, and the rules applied to administrators.
While Kindred has one developer, required approvals are zero. Community reports say these protections
are enforced on private repositories only on paid plans, so the founder created the `Kindred-Care`
organization on GitHub Team with the private repository `Kindred-Care/kindred`. Protections that are
not enforced are not protections (decision 114): criteria 8 and 9 stay Blocked until enforcement is
proven by rejected attempts.

## Decision

A repository **ruleset** named `main-protection` targeting the default branch, with **no bypass actors**
(so it applies to organization owners and repository administrators too):

| Rule | Setting |
| --- | --- |
| Restrict deletions | On |
| Block force pushes (`non_fast_forward`) | On |
| Require a pull request before merging | On, 0 required approvals, dismiss stale approvals, all review threads resolved |
| Require status checks to pass | On, branch must be up to date (strict) |
| Required checks | `repo-checks`, `secret-scan`, `lint`, `typecheck`, `build`, `test-unit`, `test-integration`, `test-architecture`, `test-mobile`, `security-tests`, `contract`, `design-tokens`, `dependency-scan` (added as each job first exists) |

Supporting settings: Dependabot alerts on; merge commits and squash allowed; branches deleted after
merge. CODEOWNERS lists security-critical paths; a required code-owner approval is switched on when a
second developer joins. High-risk changes need independent review before any production deployment.

GitHub secret scanning and push protection on private repositories need the paid Secret Protection
add-on, and dependency review needs Code Security. Neither is purchased: Milestone 1 incurs no new spend
without authorization. gitleaks (ADR 0017) and the dependency-scan job (ADR 0018) cover these instead.

## Enforcement test

Each of these must be rejected by GitHub. The commands and GitHub's responses are recorded in
[evidence/0016-enforcement.md](evidence/0016-enforcement.md).

1. A direct push of a commit to `main`.
2. A force push to `main`.
3. Deletion of `main`.
4. Merging a pull request whose required check fails, including with `gh pr merge --admin`.

## Enforcement results

Recorded in the evidence file once the tests have run. Until every attempt is shown rejected,
criteria 8 and 9 are reported as Blocked.
