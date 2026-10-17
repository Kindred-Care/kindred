import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkMatrix, parseMatrix } from './check-feature-matrix.mjs';

const catalog = JSON.parse(readFileSync('docs/architecture/permissions.json', 'utf8'));
const matrix = readFileSync('docs/architecture/feature-matrix.md', 'utf8');

test('REQ-FM-002 the committed matrix covers every V1 permission with consistent cells', () => {
  assert.deepEqual(checkMatrix(parseMatrix(matrix), catalog), []);
});

test('REQ-FM-002 the catalog has 65 active permissions and two reserved', () => {
  assert.equal(Object.values(catalog.groups).flat().length, 65);
  assert.deepEqual(catalog.reserved, ['moments.share', 'family_access.manage']);
});

test('REQ-FM-002 an unknown permission, a missing permission and a wrong cell are all caught', () => {
  const rows = parseMatrix(matrix).filter((r) => !r.permissions.includes('audit.read'));
  rows.push({ feature: 'Bogus', caregiver: '🔒', employer: '➖', permissions: ['reports.read', 'made.up'] });
  const problems = checkMatrix(rows, catalog).join('\n');
  assert.match(problems, /unknown permission made\.up/);
  assert.match(problems, /audit\.read appears on no row/);
  assert.match(problems, /Bogus: Caregiver Mobile is 🔒 but the Caregiver role holds none/);
});
