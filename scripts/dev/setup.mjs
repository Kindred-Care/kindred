#!/usr/bin/env node
// One-time local setup: creates .env from .env.example, installs the git hooks, and reports any
// missing prerequisite. Safe to re-run; it never overwrites an existing .env.

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { loadEnv } from './lib/env-file.mjs';
import { assertLocal, runGuarded } from './lib/local-guard.mjs';

function has(command, args = ['--version']) {
  const result = spawnSync(command, args, { stdio: 'ignore', shell: process.platform === 'win32' });
  return result.status === 0;
}

await runGuarded(async () => {
  if (!existsSync('.env')) {
    copyFileSync('.env.example', '.env');
    console.log('setup: created .env from .env.example');
  } else {
    console.log('setup: .env already exists, left unchanged');
  }

  assertLocal({ env: loadEnv('.env') });

  execFileSync('git', ['config', 'core.hooksPath', '.githooks']);
  console.log('setup: git hooks installed (core.hooksPath = .githooks)');

  const prerequisites = [
    ['docker', 'Docker Desktop (docker compose)'],
    ['dotnet', '.NET 10 SDK'],
    ['node', 'Node.js 22'],
    ['gitleaks', 'gitleaks (pre-commit secret scan)', ['version']],
  ];
  const missing = prerequisites.filter(([cmd, , args]) => !has(cmd, args)).map(([, label]) => label);
  if (missing.length > 0) {
    console.warn(`setup: missing prerequisites: ${missing.join(', ')}. See README, "Prerequisites".`);
    process.exitCode = 1;
  } else {
    console.log('setup: all prerequisites found. Next: docker compose up --build');
  }
});
