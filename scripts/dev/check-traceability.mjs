#!/usr/bin/env node
// Traceability check (Section 3, Refinement 4; ADR 0027). Fails when:
//   - a requirement ID is listed twice or has an unknown status,
//   - a requirement marked Implemented has no test carrying its ID,
//   - a test names a requirement ID that is not in docs/product/traceability.md.
// IDs appear in tests as REQ-AREA-NNN (JavaScript) or REQ_AREA_NNN (C#).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const STATUSES = new Set(['Implemented', 'Partial', 'Provisional', 'Blocked', 'Planned', 'Process']);
const ID = /REQ[-_][A-Z]+[-_][A-Z]*\d+/g;

export function parseRequirements(markdown) {
  const rows = [];
  for (const line of markdown.split('\n')) {
    const match = /^\| (REQ-[A-Z]+-[A-Z]*\d+) \|/.exec(line);
    if (!match) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    rows.push({ id: match[1], status: cells[5] });
  }
  return rows;
}

export function normalize(id) {
  return id.replaceAll('_', '-');
}

export function findTestIds(files) {
  const found = new Map();
  for (const [file, text] of files) {
    for (const raw of text.match(ID) ?? []) {
      const id = normalize(raw);
      if (!found.has(id)) found.set(id, new Set());
      found.get(id).add(file);
    }
  }
  return found;
}

export function check(requirements, testIds) {
  const problems = [];
  const seen = new Set();
  for (const { id, status } of requirements) {
    if (seen.has(id)) problems.push(`${id} is listed more than once`);
    seen.add(id);
    if (!STATUSES.has(status)) problems.push(`${id} has unknown status "${status}"`);
    if (status === 'Implemented' && !testIds.has(id)) problems.push(`${id} is Implemented but no test carries its ID`);
  }
  for (const [id, files] of testIds) {
    if (!seen.has(id)) problems.push(`${id} is used in ${[...files].join(', ')} but is not in traceability.md`);
  }
  return problems;
}

const TEST_FILE = /(\.test\.(mjs|ts|tsx)|Tests\.cs)$/;
const SKIP = new Set(['node_modules', 'bin', 'obj', '.git', 'dist', '.expo']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (TEST_FILE.test(name)) out.push(path);
  }
  return out;
}

function main() {
  const requirements = parseRequirements(readFileSync('docs/product/traceability.md', 'utf8'));
  const files = ['backend/tests', 'apps/mobile/src', 'apps/mobile/app', 'scripts']
    .flatMap((d) => walk(d))
    .map((f) => [f.replaceAll('\\', '/'), readFileSync(f, 'utf8')]);
  const problems = check(requirements, findTestIds(files));
  for (const p of problems) console.error(`traceability: ${p}`);
  if (problems.length > 0) process.exit(1);
  const implemented = requirements.filter((r) => r.status === 'Implemented').length;
  console.log(`traceability: ${requirements.length} requirements, ${implemented} implemented, all with tests`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
