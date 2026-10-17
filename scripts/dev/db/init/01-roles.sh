#!/bin/bash
# Local database bootstrap (runs once, as the container superuser, on an empty data directory).
#
# Creates the separate migration and application roles required by Section 6a and criterion 13:
#   kindred_migrator    owns the kindred schema and runs migrations (DDL). Never used by the API.
#   kindred_app_access  NOLOGIN group that migrations grant table privileges to, table by table.
#   kindred_app         the API's login. Member of kindred_app_access. No CREATE anywhere, no
#                       superuser, no BYPASSRLS, so it cannot change the schema or skip Row-Level
#                       Security.
# The same role layout is created by infrastructure code in Phase 2; this file is local only.
set -euo pipefail

: "${KINDRED_DB_MIGRATOR_PASSWORD:?KINDRED_DB_MIGRATOR_PASSWORD must be set (see .env.example)}"
: "${KINDRED_DB_APP_PASSWORD:?KINDRED_DB_APP_PASSWORD must be set (see .env.example)}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db="$POSTGRES_DB" \
  -v migrator_password="$KINDRED_DB_MIGRATOR_PASSWORD" \
  -v app_password="$KINDRED_DB_APP_PASSWORD" <<'SQL'
CREATE ROLE kindred_migrator LOGIN PASSWORD :'migrator_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE kindred_app_access NOLOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE kindred_app LOGIN PASSWORD :'app_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT
  IN ROLE kindred_app_access;

-- Nobody gets anything by default.
REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- The migration role may create schemas and install trusted extensions in this database only.
GRANT CONNECT, CREATE ON DATABASE :"db" TO kindred_migrator;
GRANT CONNECT ON DATABASE :"db" TO kindred_app;

-- The application schema belongs to the migration role. The application may use it, not alter it.
CREATE SCHEMA kindred AUTHORIZATION kindred_migrator;
REVOKE ALL ON SCHEMA kindred FROM PUBLIC;
GRANT USAGE ON SCHEMA kindred TO kindred_app_access;

-- Keep long-running or stuck statements from the API bounded.
ALTER ROLE kindred_app SET statement_timeout = '30s';
ALTER ROLE kindred_app SET search_path = kindred;
ALTER ROLE kindred_migrator SET search_path = kindred;
SQL

echo "kindred roles created: kindred_migrator, kindred_app_access, kindred_app"
