#!/usr/bin/env node
// Bundle dependency guard (ADR 0018). The accepted npm advisories are accepted only because the
// affected packages run at build time and never ship in the app. This check keeps that true: it reads
// the source maps from `expo export --source-maps` and fails if any listed package is in a bundle.
//   node scripts/dev/check-bundle-deps.mjs <export-dir>

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Packages with known advisories that must never reach the shipped bundle.
export const BUILD_TIME_ONLY = ['node-forge', 'braces', 'micromatch', 'sprintf-js', 'uuid'];

export function forbiddenModules(sources, packages = BUILD_TIME_ONLY) {
  return sources.filter((source) =>
    packages.some((name) => new RegExp(`node_modules/${name.replace('.', '\\.')}/`).test(source.replaceAll('\\', '/'))),
  );
}

function sourceMaps(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceMaps(path);
    return name.endsWith('.map') ? [path] : [];
  });
}

function main(dir) {
  const maps = sourceMaps(dir);
  if (maps.length === 0) {
    console.error(`bundle-deps: no source maps under ${dir}; run expo export with --source-maps`);
    process.exit(1);
  }
  let failed = false;
  for (const map of maps) {
    const { sources } = JSON.parse(readFileSync(map, 'utf8'));
    const hits = forbiddenModules(sources);
    if (hits.length > 0) {
      failed = true;
      console.error(`bundle-deps: ${map} ships build-time-only packages:\n  ${hits.join('\n  ')}`);
    } else {
      console.log(`bundle-deps: ${map}: ${sources.length} modules, none from ${BUILD_TIME_ONLY.join(', ')}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv[2] ?? 'apps/mobile/dist');
