# 0007. Private, quarantined file storage with fail-closed scanning

- Status: Accepted, verification pending (GuardDuty Malware Protection for S3 BAA coverage in writing;
  ClamAV is the fallback)
- Date: 2026-10-17
- Source: Section 2 file lifecycle and malware scanning, Section 4 file authorization and leak table

## Decision

- Uploads go through short-lived presigned URLs into a private quarantine zone. Files are released
  only after validation (type by content, size, metadata and location stripping) and a malware scan
  both pass. Failed, timed-out, skipped, unsupported or inconclusive scans keep the file quarantined.
- `IFileMalwareScanner` (Application) returns Clean, Infected or Inconclusive; only Clean releases.
  GuardDuty Malware Protection for S3 is preferred once its BAA coverage is confirmed in writing.
- Storage zones with separate keys: quarantine, restricted originals, working, servable, export. Only
  a servable variant is ever served; originals are readable only by named custodians.
- Every download is authorized by the API and audited, through a short-lived signed URL.
- "Released" means safe, not authorized for any use.

## Consequences

Built in Phase 7a (backlog B18), with synthetic data only until the G2 media protection gate.
