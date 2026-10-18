# GitHub CI evidence (criteria 5, 10 and 12) — 2026-10-17

Repository `Kindred-Care/kindred`, workflow `.github/workflows/ci.yml`, GitHub-hosted `ubuntu-24.04`
runners.

## Criterion 5: every check runs on every pull request, and all pass

PR #2 (the walking skeleton), run [39029717334](https://github.com/Kindred-Care/kindred/actions/runs/39029717334)
on head commit `21fcfe9`, event `pull_request`, conclusion `success`:

| Check | Result | Duration |
| --- | --- | --- |
| `repo-checks` | pass | 9 s |
| `secret-scan` | pass | 7 s |
| `lint` | pass | 1 min 17 s |
| `typecheck` | pass | 43 s |
| `build` | pass | 2 min 0 s |
| `test-unit` | pass | 41 s |
| `test-integration` | pass | 2 min 10 s |
| `test-architecture` | pass | 42 s |
| `test-mobile` | pass | 46 s |
| `security-tests` | pass | 1 min 13 s |
| `contract` | pass | 46 s |
| `design-tokens` | pass | 5 s |
| `dependency-scan` | pass | 57 s |

Each step ran rather than being skipped, including the Testcontainers integration tests, the
`docker compose` smoke test (criterion 1 on Linux), the oasdiff breaking-change check, the bundle guard
and the CycloneDX inventory. The security-trait suite is its own check (`security-tests`), reported
separately from `test-integration` and `test-architecture`. All 13 are required checks in the `main`
ruleset, and PR #2 merged only after GitHub reported `mergeStateStatus: CLEAN`.

## Criterion 10: an endpoint with no declared permission fails the build

PR #3 (never merged; closed) added `GET /v1/enforcement-probe` with no `[RequirePermission]` or
`[PublicEndpoint]` and regenerated the contract, so the failure was isolated. Run
[39080708051](https://github.com/Kindred-Care/kindred/actions/runs/39080708051): every check passed
except `security-tests`, which failed with:

```text
failed Kindred.ArchitectureTests.EndpointDeclarationTests.REQ_SEC_002_the_running_app_exposes_health_as_its_only_public_endpoint
  GET v1/enforcement-probe declares neither a permission nor public access.
failed Kindred.ArchitectureTests.EndpointDeclarationTests.REQ_SEC_002_every_action_declares_a_permission_or_is_explicitly_public
  Assert.Empty() Failure: Collection was not empty
```

The ruleset then refused to merge PR #3 by every route (ADR 0016 evidence, test 4). Runtime denial of
an undeclared endpoint is proven by `DefaultDenyTests`, which passed in the same suite on PR #2.

## Criterion 12: contract drift fails CI, and a breaking change is flagged

Both pull requests removed the `checks` property from the health response and were closed unmerged.

| PR | Change | `contract` result | Failing step |
| --- | --- | --- | --- |
| #4 | C# changed; specification and client **not** regenerated | fail | "Fail if either differs from what is committed": *The API contract changed without regenerating the committed specification or client.* (breaking-change step skipped) |
| #5 | C# changed; specification and client regenerated correctly | fail | Drift step passed; "Breaking-change check against the base branch" failed |

oasdiff's findings on PR #5:

```text
##[error]in API GET /v1/health removed the required property `checks` from the response with the `200` status
##[error]in API GET /v1/health removed the required property `checks` from the response with the `503` status
##[error]Breaking API change detected. Version the endpoint, or label the pull request contract:breaking-approved with the reason in its description.
```

`test-integration` also failed on both pull requests, because the health tests assert the removed
field. That is expected and does not affect the contract evidence.
