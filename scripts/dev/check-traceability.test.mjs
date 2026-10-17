import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, findTestIds, parseRequirements } from './check-traceability.mjs';

const doc = [
  '| ID | Requirement | Source | Phase / epic | Implementation | Status | Tests |',
  '| REQ-SEC-001 | Default deny | §6a | 1 | x | Implemented | t |',
  '| REQ-DATA-001 | UUIDv7 | §2 | 1 | x | Implemented | t |',
  '| REQ-ACC-T13 | Matrix | App. C | 2 | | Planned | |',
].join('\n');

test('REQ-PLAT-021 parses requirement rows and their status', () => {
  assert.deepEqual(parseRequirements(doc).map((r) => [r.id, r.status]), [
    ['REQ-SEC-001', 'Implemented'],
    ['REQ-DATA-001', 'Implemented'],
    ['REQ-ACC-T13', 'Planned'],
  ]);
});

test('REQ-PLAT-021 C# and JavaScript test names both count', () => {
  const ids = findTestIds([
    ['a.cs', 'public void REQ_SEC_001_denies()'],
    ['b.test.ts', "it('REQ-DATA-001 is v7')"],
  ]);
  assert.deepEqual(check(parseRequirements(doc), ids), []);
});

test('REQ-PLAT-021 an implemented requirement without a test fails', () => {
  const problems = check(parseRequirements(doc), findTestIds([['a.cs', 'REQ_SEC_001_x']]));
  assert.deepEqual(problems, ['REQ-DATA-001 is Implemented but no test carries its ID']);
});

test('REQ-PLAT-021 unknown IDs, duplicates and bad statuses fail', () => {
  const bad = `${doc}\n| REQ-SEC-001 | again | x | x | x | Done | x |`;
  const problems = check(parseRequirements(bad), findTestIds([['a.cs', `REQ_SEC_001 REQ_DATA_001 ${'REQ_' + 'NOPE_009'}`]])).join('\n');
  assert.match(problems, /REQ-SEC-001 is listed more than once/);
  assert.match(problems, /unknown status "Done"/);
  assert.ok(problems.includes(`${'REQ-' + 'NOPE-009'} is used in a.cs but is not in traceability.md`));
});
