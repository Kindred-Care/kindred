#!/usr/bin/env node
// Destroys the local database volume and recreates it empty (the bootstrap and migrations run again
// on the next `docker compose up`). Local only, with typed confirmation.

import { execFileSync } from 'node:child_process';
import { loadEnv } from './lib/env-file.mjs';
import { assertLocal, confirmTyped, runGuarded } from './lib/local-guard.mjs';

await runGuarded(async () => {
  const env = loadEnv('.env');
  assertLocal({ env, databaseConnection: `Host=${env.KINDRED_DB_HOST ?? 'localhost'}` });
  await confirmTyped('reset local database');
  execFileSync('docker', ['compose', 'down', '--volumes', '--remove-orphans'], { stdio: 'inherit' });
  console.log('db-reset: local database removed. Run `docker compose up --build` to recreate it.');
});
