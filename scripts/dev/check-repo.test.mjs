import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPaths, REQUIRED_PATHS } from './check-repo.mjs';

const allPresent = () => true;

test('REQ-PLAT-007 a clean tree passes', () => {
  assert.deepEqual(checkPaths(['README.md', 'backend/Kindred.Api/Program.cs'], allPresent), []);
});

test('REQ-PLAT-007 a missing required file fails', () => {
  const problems = checkPaths([], (p) => p !== REQUIRED_PATHS[0]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /missing required file/);
});

test('REQ-PLAT-008 .env and key material are rejected, .env.example is allowed', () => {
  const problems = checkPaths(
    ['.env', 'apps/mobile/.env.local', 'certs/server.pem', 'android/release.keystore', '.env.example'],
    allPresent,
  );
  assert.equal(problems.length, 4);
  assert.ok(problems.every((p) => p.startsWith('forbidden file committed')));
});

test('REQ-PLAT-009 images are only allowed in the placeholder folders', () => {
  const problems = checkPaths(
    ['apps/mobile/assets/placeholder/avatar-01.png', 'scripts/seed/photos/client.jpg'],
    allPresent,
  );
  assert.deepEqual(problems, ['image outside the placeholder folders: scripts/seed/photos/client.jpg']);
});
