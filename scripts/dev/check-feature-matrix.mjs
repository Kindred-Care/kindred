#!/usr/bin/env node
// Feature matrix check (Section 7 release rule 2; ADR 0027). Fails if a V1 permission from the
// Section 6 catalog appears on no row, if a row names an unknown permission, or if a cell offers a
// feature to a role that holds none of the row's permissions.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DESIGNATIONS = ['MediaReviewer', 'RestrictedOriginalCustodian', 'ExportCustodian'];

export function parseMatrix(markdown) {
  const block = /<!-- feature-matrix:start -->([\s\S]*?)<!-- feature-matrix:end -->/.exec(markdown);
  if (!block) throw new Error('feature-matrix markers not found');
  const lines = block[1].trim().split('\n').slice(2); // header and separator
  return lines.map((line) => {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const [feature, caregiver, employer, , , permissionText] = cells;
    const permissions = [...permissionText.matchAll(/`([a-z_.]+)`/g)].map((m) => m[1]);
    return { feature, caregiver, employer, permissions };
  });
}

export function checkMatrix(rows, catalog) {
  const active = new Set(Object.values(catalog.groups).flat());
  const reserved = new Set(catalog.reserved);
  const holds = (role, permissions) => permissions.some((p) => catalog.roles[role].holds.includes(p));
  const problems = [];

  for (const row of rows) {
    for (const p of row.permissions) {
      if (!active.has(p) && !reserved.has(p)) problems.push(`${row.feature}: unknown permission ${p}`);
    }
    if (row.permissions.length === 0 || row.permissions.every((p) => reserved.has(p))) continue;

    const caregiverLock = row.caregiver.startsWith('🔒');
    const employerLock = row.employer.startsWith('🔒');
    const employerIfCaregiver = row.employer.startsWith('➖') && row.employer.includes('🔒');
    const keyed = row.caregiver.startsWith('🔑') || row.employer.includes('🔑');

    if (caregiverLock && !holds('Caregiver', row.permissions)) {
      problems.push(`${row.feature}: Caregiver Mobile is 🔒 but the Caregiver role holds none of its permissions`);
    }
    if (employerLock && !holds('OrganizationAdministrator', row.permissions)) {
      problems.push(`${row.feature}: Employer Mobile is 🔒 but the Organization Administrator holds none of its permissions`);
    }
    if (employerIfCaregiver && !holds('Caregiver', row.permissions)) {
      problems.push(`${row.feature}: offered to employers who are also caregivers, but the Caregiver role holds none of its permissions`);
    }
    if (keyed && !DESIGNATIONS.some((d) => holds(d, row.permissions))) {
      problems.push(`${row.feature}: 🔑 but no designation holds any of its permissions`);
    }
  }

  const covered = new Set(rows.flatMap((r) => r.permissions));
  for (const p of active) {
    if (!covered.has(p)) problems.push(`V1 permission ${p} appears on no row`);
  }
  return problems;
}

function main() {
  const rows = parseMatrix(readFileSync('docs/architecture/feature-matrix.md', 'utf8'));
  const catalog = JSON.parse(readFileSync('docs/architecture/permissions.json', 'utf8'));
  const problems = checkMatrix(rows, catalog);
  for (const p of problems) console.error(`feature-matrix: ${p}`);
  if (problems.length > 0) process.exit(1);
  console.log(`feature-matrix: ${rows.length} rows cover all ${Object.values(catalog.groups).flat().length} V1 permissions`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
