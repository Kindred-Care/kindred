#!/usr/bin/env node
// Seed script. Local only (guarded) and synthetic only (validated before anything is written).
//
// Milestone 1 has no feature tables, so the seed writes the synthetic dataset to
// scripts/seed/out/seed.json. From Phase 2 it inserts the same dataset through the API's
// persistence layer once the identity and client tables exist.

import { mkdirSync, writeFileSync } from 'node:fs';
import { loadEnv } from '../dev/lib/env-file.mjs';
import { assertLocal, GuardError, runGuarded } from '../dev/lib/local-guard.mjs';
import { generate, validateSynthetic } from './synthetic.mjs';

await runGuarded(async () => {
  const env = loadEnv('.env');
  assertLocal({ env, databaseConnection: `Host=${env.KINDRED_DB_HOST ?? 'localhost'}` });

  const dataset = generate();
  const problems = validateSynthetic(dataset);
  if (problems.length > 0) throw new GuardError(`Refusing to seed non-synthetic data:\n- ${problems.join('\n- ')}`);

  mkdirSync('scripts/seed/out', { recursive: true });
  writeFileSync('scripts/seed/out/seed.json', `${JSON.stringify(dataset, null, 2)}\n`);
  const count = dataset.organizations.reduce((n, o) => n + o.administrators.length + o.caregivers.length + o.clients.length, 0);
  console.log(`seed: wrote ${count} synthetic people in ${dataset.organizations.length} organizations to scripts/seed/out/seed.json`);
});
