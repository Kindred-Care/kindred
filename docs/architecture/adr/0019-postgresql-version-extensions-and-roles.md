# 0019. PostgreSQL 18, required extensions, and separate migration and application roles

- Status: Accepted (RDS availability recorded from AWS documentation; a live RDS check waits for Phase 2
  because Milestone 1 uses no AWS)
- Date: 2026-10-17
- Source: Section 4 migrations and recovery, Section 6a, Section 10 criterion 13, spike S7; decision 35

## PostgreSQL version

Decision 35: use the latest major version RDS supports at Milestone 1, 16 or later. On 2026-10-17 the
AWS RDS for PostgreSQL documentation lists 18.1 to 18.6 as generally available (announced November
2025); PostgreSQL 19 appears only as Beta and RC builds in the RDS Preview environment. **Kindred uses
PostgreSQL 18**, pinned to the `postgres:18.6` image locally and in CI.

## Extensions

| Extension | Why | RDS for PostgreSQL 18 | Local 18.6 |
| --- | --- | --- | --- |
| `btree_gist` | Exclusion constraint against overlapping client assignments | 1.8 on 18.1 to 18.6 | Recorded by `REQ_DATA_007` test |
| `pg_trgm` | Optional trigram index for client name search | 1.6 on 18.1 to 18.6 | Recorded by `REQ_DATA_007` test |

Both are trusted extensions, so the migration role can install them without superuser rights. The
baseline migration installs them in the `kindred` schema. The integration test writes the measured
server version and available extension versions to `artifacts/criterion-13-postgres.json` on every run.

## Roles

| Role | Login | Purpose | Can |
| --- | --- | --- | --- |
| `kindred_migrator` | Yes | Runs migrations only, never used by the API | Owns schema `kindred`; `CONNECT, CREATE` on the database |
| `kindred_app_access` | No | Group that migrations grant table privileges to, table by table | `USAGE` on schema `kindred` |
| `kindred_app` | Yes | The API's connection | Member of `kindred_app_access`; nothing else |

Every role is `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`. `PUBLIC` loses all
rights on the database and the `public` schema. No default privileges are used: each migration grants
exactly what the application needs on each new table (append-only tables get `INSERT, SELECT` only), and
EF Core's migration history table is not granted to the application at all.

Migrations run as `kindred_migrator` through an EF Core migration bundle (the `migrate` service locally,
the deployment pipeline later), never at API start-up.

## Evidence

`DatabaseBaselineTests` (criterion 13): the baseline applies to a brand-new empty database; the
application role is refused (`42501 insufficient_privilege`) for `CREATE TABLE` in either schema,
`CREATE SCHEMA`, `ALTER TABLE`, `DROP TABLE`, `TRUNCATE`, `DELETE` on migration history, `CREATE
EXTENSION` and `CREATE ROLE`; its role attributes are all false; and it can still connect and query.
