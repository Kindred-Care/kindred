# 0017. gitleaks in CI and as a pre-commit hook

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3 follow-up decisions, Section 9 pipeline, Section 10 criterion 7; decision 114

## Decision

- **gitleaks 8.30.1**, configured by `.gitleaks.toml` (default rules plus an allowlist of the exact
  `local-dev-only-*` placeholder values in `.env.example`, never a path allowlist).
- CI job `secret-scan` scans the full history on every pull request and push, with the binary verified
  against a pinned SHA-256 checksum. The official gitleaks GitHub Action is not used because it needs a
  paid licence for organization accounts.
- `.githooks/pre-commit` runs `gitleaks git --pre-commit --staged`, because CI only sees a secret after
  it has been pushed. The hook fails closed when gitleaks is missing. `npm run setup` sets
  `core.hooksPath`.
- Tests never contain a secret-shaped literal; fake tokens are assembled at runtime so the scanner needs
  no test exemptions.
- `.env.example` documents every variable; `.env` and key material are rejected by `repo-checks`.

## Consequences

gitleaks is a supplementary safeguard. It does not replace branch protection (ADR 0016) and does not
replace GitHub push protection, which would need a paid add-on.
