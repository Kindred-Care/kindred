#!/usr/bin/env node
// Generates apps/mobile/src/design/tokens.ts from design/tokens/tokens.json.
//   node tokens.mjs           write the file
//   node tokens.mjs --check   fail on drift or a contrast failure (CI job "design-tokens")
// Placeholders produce a warning (a GitHub annotation in CI) until approved values replace them.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkContrast, flatten, renderTypeScript, resolve } from './tokens-lib.mjs';

const root = resolvePath(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourcePath = resolvePath(root, 'design/tokens/tokens.json');
const outputPath = resolvePath(root, 'apps/mobile/src/design/tokens.ts');
const check = process.argv.includes('--check');
const inCi = process.env.GITHUB_ACTIONS === 'true';

const tree = JSON.parse(readFileSync(sourcePath, 'utf8'));
const resolved = resolve(flatten(tree));
const output = renderTypeScript(resolved);
let failed = false;

for (const result of checkContrast(tree, resolved)) {
  const line = `${result.foreground} on ${result.background}: ${result.ratio.toFixed(2)}:1 (needs ${result.minimum}:1) - ${result.usage}`;
  if (!result.passes) {
    failed = true;
    console.error(inCi ? `::error file=design/tokens/tokens.json::Contrast failure: ${line}` : `contrast FAIL ${line}`);
  } else {
    console.log(`contrast ok   ${line}${result.placeholder ? ' [placeholder]' : ''}`);
  }
}

const placeholders = Object.values(resolved).filter((t) => t.status !== 'approved').length;
if (placeholders > 0) {
  const message = `${placeholders} of ${Object.keys(resolved).length} design tokens are placeholders awaiting approved Figma values. Visual acceptance (criterion 3) is Provisional.`;
  console.warn(inCi ? `::warning file=design/tokens/tokens.json::${message}` : `WARNING: ${message}`);
}

if (check) {
  const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== output) {
    failed = true;
    console.error('apps/mobile/src/design/tokens.ts is out of date. Run `npm run codegen` and commit the result.');
  }
} else {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output);
  console.log(`wrote ${outputPath}`);
}

process.exit(failed ? 1 : 0);
