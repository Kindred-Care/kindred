import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { Readable, Writable } from 'node:stream';
import { assertLocal, confirmTyped, databaseHost, GuardError } from './lib/local-guard.mjs';

const allowlist = { databaseHosts: ['localhost', '127.0.0.1', '::1', 'db'], awsAccounts: [] };
const local = { KINDRED_ENVIRONMENT: 'Local' };

test('REQ-PLAT-015 runs when the environment is explicitly Local', () => {
  assert.doesNotThrow(() => assertLocal({ env: local, databaseConnection: 'Host=localhost;Database=kindred', allowlist }));
});

test('REQ-PLAT-015 refuses when KINDRED_ENVIRONMENT is unset or anything but Local', () => {
  for (const value of [undefined, '', 'local', 'Development', 'Staging', 'Production']) {
    assert.throws(() => assertLocal({ env: { KINDRED_ENVIRONMENT: value }, allowlist }), GuardError);
  }
});

test('REQ-PLAT-015 refuses a database host that is not on the allowlist', () => {
  for (const connection of [
    'Host=kindred-prod.abc123.us-east-1.rds.amazonaws.com;Database=kindred',
    'Server=10.0.4.12;Database=kindred',
    'postgres://user:pw@db.example.org:5432/kindred',
    'Database=kindred',
  ]) {
    assert.throws(() => assertLocal({ env: local, databaseConnection: connection, allowlist }), GuardError, connection);
  }
  assert.throws(() => assertLocal({ env: { ...local, KINDRED_DB_HOST: 'prod-db' }, allowlist }), GuardError);
});

test('REQ-PLAT-015 refuses when AWS credentials for an unlisted account are present', () => {
  for (const variable of ['AWS_PROFILE', 'AWS_ACCESS_KEY_ID', 'AWS_SESSION_TOKEN', 'AWS_ACCOUNT_ID']) {
    assert.throws(() => assertLocal({ env: { ...local, [variable]: 'x' }, allowlist }), GuardError, variable);
  }
  const devAccount = { ...allowlist, awsAccounts: ['111111111111'] };
  assert.doesNotThrow(() => assertLocal({ env: { ...local, AWS_PROFILE: 'dev', AWS_ACCOUNT_ID: '111111111111' }, allowlist: devAccount }));
});

test('REQ-PLAT-015 parses hosts from both connection string styles', () => {
  assert.equal(databaseHost('Host=db;Port=5432'), 'db');
  assert.equal(databaseHost('server = localhost ; database=x'), 'localhost');
  assert.equal(databaseHost('postgresql://u:p@[::1]:5432/x'), '::1');
});

function io(answer) {
  return { input: Readable.from([`${answer}\n`]), output: new Writable({ write: (_c, _e, cb) => cb() }) };
}

test('REQ-PLAT-015 destructive scripts require the exact typed phrase', async () => {
  await assert.doesNotReject(confirmTyped('reset local database', io('reset local database')));
  await assert.rejects(confirmTyped('reset local database', io('yes')), GuardError);
  await assert.rejects(confirmTyped('reset local database', io('')), GuardError);
});

test('REQ-PLAT-015 the real scripts exit 2 without touching anything outside Local', () => {
  for (const script of ['scripts/seed/seed.mjs', 'scripts/dev/db-reset.mjs']) {
    const result = spawnSync(process.execPath, [script], {
      env: { PATH: process.env.PATH, KINDRED_ENVIRONMENT: 'Production' },
      encoding: 'utf8',
      input: 'reset local database\n',
    });
    assert.equal(result.status, 2, `${script}: ${result.stderr}`);
    assert.match(result.stderr, /Refusing to run/);
  }
});
