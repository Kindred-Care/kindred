import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advisories, evaluate } from './check-npm-audit.mjs';

const audit = {
  vulnerabilities: {
    braces: { via: [{ url: 'https://github.com/advisories/GHSA-aaaa', severity: 'high', title: 'DoS' }] },
    micromatch: { via: ['braces'] },
    uuid: { via: [{ url: 'https://github.com/advisories/GHSA-bbbb', severity: 'moderate', title: 'bounds' }] },
  },
};
const exception = { advisory: 'GHSA-aaaa', package: 'braces', reason: 'build only', adr: 'adr', reviewBy: '2027-01-15' };

test('REQ-PLAT-019 an unlisted high advisory blocks', () => {
  const { errors } = evaluate(advisories(audit), [], new Date('2026-10-17'));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /braces GHSA-aaaa/);
});

test('REQ-PLAT-019 a documented, unexpired exception allows it and moderates only warn', () => {
  const { errors, warnings } = evaluate(advisories(audit), [exception], new Date('2026-10-17'));
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
});

test('REQ-PLAT-019 an expired exception blocks', () => {
  const { errors } = evaluate(advisories(audit), [exception], new Date('2027-02-01'));
  assert.match(errors.join(), /expired/);
});
