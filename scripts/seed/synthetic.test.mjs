import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, validateSynthetic } from './synthetic.mjs';

test('REQ-PLAT-016 the generated dataset is synthetic by every rule', () => {
  const dataset = generate();
  assert.deepEqual(validateSynthetic(dataset), []);
  assert.ok(dataset.organizations.every((o) => o.clients.length > 0 && o.caregivers.length > 0));
});

test('REQ-PLAT-016 generation is deterministic for a given seed', () => {
  assert.deepEqual(generate({ seed: 7 }), generate({ seed: 7 }));
  assert.notDeepEqual(generate({ seed: 7 }), generate({ seed: 8 }));
});

test('REQ-PLAT-016 the validator rejects anything that looks real', () => {
  const dataset = generate();
  const client = dataset.organizations[0].clients[0];
  Object.assign(client, {
    familyName: 'Johnson',
    email: 'mary.johnson@gmail.com',
    phone: '+1-404-867-5309',
    avatar: { kind: 'photo', uri: 'file:///Downloads/mary.jpg' },
  });

  const problems = validateSynthetic(dataset);
  assert.equal(problems.length, 4);
  assert.match(problems.join('\n'), /synthetic surname/);
  assert.match(problems.join('\n'), /non-reserved email domain: gmail\.com/);
  assert.match(problems.join('\n'), /555-0100/);
  assert.match(problems.join('\n'), /generated placeholder/);
});

test('REQ-PLAT-016 the validator rejects a dataset not marked synthetic', () => {
  assert.ok(validateSynthetic({ organizations: [] }).length > 0);
});
