#!/usr/bin/env node
// Repository hygiene check (CI job "repo-checks").
//
// Fails when the Section 3 structure loses a required file, when a file type that
// must never be committed appears (keys, certificates, .env files), or when an
// image is added outside the folders allowed to hold synthetic or generated
// placeholders. It complements gitleaks, which looks inside file contents.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const REQUIRED_PATHS = [
  'README.md',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.gitleaks.toml',
  '.githooks/pre-commit',
  '.github/CODEOWNERS',
  '.github/pull_request_template.md',
  'docs/security/review-checklist.md',
  'apps/web/README.md',
];

// Committed by mistake these would leak credentials or signing material.
export const FORBIDDEN_PATTERNS = [
  /(^|\/)\.env$/,
  /(^|\/)\.env\.(?!example$)[^/]+$/,
  /\.(pem|p12|pfx|key|keystore|jks|mobileprovision|p8)$/i,
  /(^|\/)credentials\.json$/i,
  /(^|\/)google-services\.json$/i,
  /(^|\/)GoogleService-Info\.plist$/i,
];

// Images are allowed only where synthetic or generated placeholders live, so a
// Figma or client photograph cannot slip into source, fixtures or seed data.
export const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp|heic|bmp|tiff?)$/i;
export const IMAGE_ALLOWED_PREFIXES = [
  'apps/mobile/assets/placeholder/',
  'apps/mobile/assets/app/',
  'docs/acceptance/',
  'docs/architecture/adr/evidence/',
];

export function checkPaths(trackedFiles, exists = existsSync) {
  const problems = [];
  for (const required of REQUIRED_PATHS) {
    if (!exists(required)) problems.push(`missing required file: ${required}`);
  }
  for (const file of trackedFiles) {
    if (FORBIDDEN_PATTERNS.some((p) => p.test(file))) {
      problems.push(`forbidden file committed: ${file}`);
    }
    if (IMAGE_PATTERN.test(file) && !IMAGE_ALLOWED_PREFIXES.some((p) => file.startsWith(p))) {
      problems.push(`image outside the placeholder folders: ${file}`);
    }
  }
  return problems;
}

function main() {
  const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const problems = checkPaths(tracked);
  if (problems.length > 0) {
    for (const p of problems) console.error(`repo-checks: ${p}`);
    process.exit(1);
  }
  console.log(`repo-checks: ${tracked.length} tracked files OK`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
