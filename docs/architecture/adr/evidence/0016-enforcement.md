# ADR 0016 enforcement evidence

Repository `Kindred-Care/kindred` (private) in the `Kindred-Care` organization on the **GitHub Team**
plan. Tests run on 2026-10-17 by the repository administrator account `EyeTeaAri`, the most privileged
account in the organization, so a rejection here applies to everyone.

## The ruleset under test

`main-protection` (id 25301047), created through the REST API from this definition:

| Setting | Value |
| --- | --- |
| Target | `~DEFAULT_BRANCH` (`main`) |
| Enforcement | `active` |
| Bypass actors | none (`[]`); GitHub reports `current_user_can_bypass: "never"` for the admin account |
| Rules | `deletion`, `non_fast_forward`, `pull_request` (0 approvals, stale reviews dismissed, threads resolved, merge or squash), `required_status_checks` (strict, GitHub Actions only) |
| Required checks | `repo-checks`, `secret-scan` during tests 1 to 3; from 2026-10-17 23:51 UTC all 13 Section 3 checks: `repo-checks`, `secret-scan`, `lint`, `typecheck`, `build`, `test-unit`, `test-integration`, `test-architecture`, `test-mobile`, `security-tests`, `contract`, `design-tokens`, `dependency-scan` (strict: branch must be up to date) |

## Results

| # | Attempt | Result | Rejected by |
| --- | --- | --- | --- |
| 1 | Direct push of a commit to `main` | **Rejected** | Ruleset (GH013: changes must be made through a pull request; required checks expected) |
| 2 | Force push rewriting `main` | **Rejected** | Ruleset (GH013: cannot force-push to this branch) |
| 3a | Delete `main` with git | Rejected | GitHub's default-branch safeguard ("refusing to delete the current branch") |
| 3b | Delete `main` through the REST API | Rejected | GitHub's default-branch safeguard ("Cannot delete the default branch") |
| 3c | Delete a branch the ruleset targets, with git and the REST API | **Rejected** | Ruleset (GH013: cannot delete this branch) |
| 4a | Merge PR #3 (required check `security-tests` failing) with `gh pr merge` | **Rejected** | Ruleset ("the base branch policy prohibits the merge") |
| 4b | Same, with the administrator override `gh pr merge --admin` | **Rejected** | Ruleset, server side ("Required status check 'security-tests' is failing") |
| 4c | Same, through the REST merge endpoint directly | **Rejected** | Ruleset, HTTP 405 with the same rule violation |

Attempts 3a and 3b prove `main` cannot be deleted, but by GitHub's own rule for default branches rather
than ours. Attempt 3c proves the ruleset's deletion rule independently: the ruleset was extended for a
few seconds to a throwaway `enforcement-probe` branch, both deletions were refused, and the ruleset was
then restored to `~DEFAULT_BRANCH` before the probe was removed. A first try at 3c was discarded as
invalid: the ruleset update had not applied (a local tooling error), so that run tested an unprotected
branch and its deletion succeeded, as it should have.

`main` was at `b5f40e6` before and after tests 1 to 3. PR #1 then merged through the ruleset after
`repo-checks` and `secret-scan` passed (merge commit `5f25600`). The ruleset was then raised to all 13
required checks, and PR #2 merged through it only once GitHub reported `mergeStateStatus: CLEAN` (13 of
13 checks passed on an up-to-date branch; merge commit `576783a`).

For test 4, PR #3 (never to be merged) added an endpoint with no declared permission and regenerated
the contract, so exactly one required check failed: `security-tests`. All three merge routes were
refused, `main` stayed at `576783a`, and PR #3 was closed unmerged with its branch deleted.

**Conclusion: criteria 8 and 9 are met.** Every restriction Section 3 requires is enforced on the GitHub
Team plan for administrators as well as everyone else: no direct push, no force push, no deletion, and no
merge without every required check passing on an up-to-date branch. No paid add-on was needed.

## Final ruleset (as returned by the GitHub API after the tests)

```json
{
  "bypass_actors": [],
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "~DEFAULT_BRANCH"
      ]
    }
  },
  "current_user_can_bypass": "never",
  "enforcement": "active",
  "name": "main-protection",
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "parameters": {
        "allowed_merge_methods": [
          "merge",
          "squash"
        ],
        "dismiss_stale_reviews_on_push": true,
        "dismissal_restriction": {
          "allowed_actors": [],
          "enabled": false
        },
        "require_code_owner_review": false,
        "require_extra_approval_for_unattributed_changes": true,
        "require_last_push_approval": false,
        "required_approving_review_count": 0,
        "required_review_thread_resolution": true,
        "required_reviewers": []
      },
      "type": "pull_request"
    },
    {
      "parameters": {
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          {
            "context": "repo-checks",
            "integration_id": 15368
          },
          {
            "context": "secret-scan",
            "integration_id": 15368
          },
          {
            "context": "lint",
            "integration_id": 15368
          },
          {
            "context": "typecheck",
            "integration_id": 15368
          },
          {
            "context": "build",
            "integration_id": 15368
          },
          {
            "context": "test-unit",
            "integration_id": 15368
          },
          {
            "context": "test-integration",
            "integration_id": 15368
          },
          {
            "context": "test-architecture",
            "integration_id": 15368
          },
          {
            "context": "test-mobile",
            "integration_id": 15368
          },
          {
            "context": "security-tests",
            "integration_id": 15368
          },
          {
            "context": "contract",
            "integration_id": 15368
          },
          {
            "context": "design-tokens",
            "integration_id": 15368
          },
          {
            "context": "dependency-scan",
            "integration_id": 15368
          }
        ],
        "strict_required_status_checks_policy": true
      },
      "type": "required_status_checks"
    }
  ]
}
```

## Transcripts

### Tests 1 to 3b

```text
## Test 1: direct push of a new commit to main
$ git push origin HEAD:main
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/Kindred-Care/kindred/rules?ref=refs%2Fheads%2Fmain
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - 2 of 2 required status checks are expected.
remote:
To https://github.com/Kindred-Care/kindred.git
 ! [remote rejected] HEAD -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Kindred-Care/kindred.git'
exit code: 1

## Test 2: force push that rewrites main
$ git push --force origin HEAD:main
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/Kindred-Care/kindred/rules?ref=refs%2Fheads%2Fmain
remote:
remote: - Cannot force-push to this branch
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - 2 of 2 required status checks are expected.
remote:
To https://github.com/Kindred-Care/kindred.git
 ! [remote rejected] HEAD -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Kindred-Care/kindred.git'
exit code: 1

## Test 3a: delete main with git
$ git push origin --delete main
To https://github.com/Kindred-Care/kindred.git
 ! [remote rejected] main (refusing to delete the current branch: refs/heads/main)
error: failed to push some refs to 'https://github.com/Kindred-Care/kindred.git'
exit code: 1

## Test 3b: delete main through the REST API
$ gh api -X DELETE repos/Kindred-Care/kindred/git/refs/heads/main
{"message":"Cannot delete the default branch","documentation_url":"https://docs.github.com/rest/git/refs#delete-a-reference","status":"422"}gh: Cannot delete the default branch (HTTP 422)
exit code: 1

## main afterwards
$ git ls-remote origin main
b5f40e63b4d2fc742f5fbc6d03f1027574feb44a	refs/heads/main
```

### Test 3c

```text
## Test 3c: deletion blocked by the ruleset's own deletion rule (not the default-branch safeguard)
$ gh api -X POST repos/Kindred-Care/kindred/git/refs -f ref=refs/heads/enforcement-probe
refs/heads/enforcement-probe
# temporarily add refs/heads/enforcement-probe to the ruleset's targets
["~DEFAULT_BRANCH","refs/heads/enforcement-probe"]
$ git push origin --delete enforcement-probe
remote: error: GH013: Repository rule violations found for refs/heads/enforcement-probe.
remote: Review all repository rules at https://github.com/Kindred-Care/kindred/rules?ref=refs%2Fheads%2Fenforcement-probe
remote:
remote: - Cannot delete this branch
remote:
To https://github.com/Kindred-Care/kindred.git
 ! [remote rejected] enforcement-probe (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Kindred-Care/kindred.git'
exit code: 1
$ gh api -X DELETE repos/Kindred-Care/kindred/git/refs/heads/enforcement-probe
{"message":"Repository rule violations found\n\nCannot delete this branch\n\n","documentation_url":"https://docs.github.com/rest/git/refs#delete-a-reference","status":"422"}gh: Repository rule violations found

Cannot delete this branch

 (HTTP 422)
exit code: 1
$ git ls-remote origin enforcement-probe
b5f40e63b4d2fc742f5fbc6d03f1027574feb44a	refs/heads/enforcement-probe
# restore the ruleset to the default branch only, then remove the probe branch
["~DEFAULT_BRANCH"]
probe branch removed after the ruleset no longer targets it
```

### Test 4

```text
## Test 4: merge a pull request whose required check failed (PR #3)
$ gh pr view 3 --json mergeStateStatus,headRefOid
{"head":"98a8602","mergeStateStatus":"BLOCKED","mergeable":"MERGEABLE"}
$ gh pr checks 3   (non-passing checks)
security-tests: fail

$ gh pr merge 3 --merge
X Pull request Kindred-Care/kindred#3 is not mergeable: the base branch policy prohibits the merge.
To have the pull request merged after all the requirements have been met, add the `--auto` flag.
To use administrator privileges to immediately merge the pull request, add the `--admin` flag.
exit code: 1

$ gh pr merge 3 --merge --admin
GraphQL: Repository rule violations found

Required status check "security-tests" is failing.

 (mergePullRequest)
exit code: 1

$ gh api -X PUT repos/Kindred-Care/kindred/pulls/3/merge   (REST API, bypassing the CLI)
{"message":"Repository rule violations found\n\nRequired status check \"security-tests\" is failing.\n\n","documentation_url":"https://docs.github.com/rest/pulls/pulls#merge-a-pull-request","status":"405"}gh: Repository rule violations found

Required status check "security-tests" is failing.

 (HTTP 405)
exit code: 1

$ gh pr view 3 --json state
{"mergedAt":null,"state":"OPEN"}
$ git ls-remote origin main
576783a9b2eb7af786ce0c1fdfd770ef36ad9443	refs/heads/main
```
