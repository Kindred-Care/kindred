#!/usr/bin/env node
// npm vulnerability gate (CI job "dependency-scan"; Section 3 and Section 9).
//   node scripts/dev/check-npm-audit.mjs <package-dir> [...]
// Fails on any high or critical advisory that is not in docs/security/dependency-exceptions.json,
// and on any exception past its review date. Moderate and low advisories are reported as warnings.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const BLOCKING = new Set(['high', 'critical']);

/** Collapses `npm audit --json` output into one entry per advisory. */
export function advisories(auditJson) {
  const found = new Map();
  for (const [name, info] of Object.entries(auditJson.vulnerabilities ?? {})) {
    for (const via of info.via ?? []) {
      if (typeof via !== 'object') continue;
      const id = via.url?.split('/').pop() ?? String(via.source);
      found.set(`${id}:${name}`, { advisory: id, package: name, severity: via.severity, title: via.title, url: via.url });
    }
  }
  return [...found.values()];
}

export function evaluate(found, exceptions, today = new Date()) {
  const errors = [];
  const warnings = [];
  for (const item of found) {
    const exception = exceptions.find((e) => e.advisory === item.advisory && e.package === item.package);
    if (!BLOCKING.has(item.severity)) {
      warnings.push(`${item.severity} ${item.package} ${item.advisory}: ${item.title}`);
    } else if (!exception) {
      errors.push(`${item.severity} ${item.package} ${item.advisory}: ${item.title} (${item.url})`);
    }
  }
  for (const exception of exceptions) {
    if (new Date(`${exception.reviewBy}T23:59:59Z`) < today) {
      errors.push(`exception for ${exception.package} ${exception.advisory} expired on ${exception.reviewBy}; review it and update ${exception.adr}`);
    }
    if (!exception.reason || !exception.adr) errors.push(`exception for ${exception.package} needs a reason and an ADR`);
  }
  return { errors, warnings };
}

function main(dirs) {
  const exceptions = JSON.parse(readFileSync('docs/security/dependency-exceptions.json', 'utf8')).npm;
  let failed = false;
  for (const dir of dirs) {
    let output;
    try {
      output = execFileSync('npm', ['audit', '--json'], { cwd: dir, encoding: 'utf8', shell: process.platform === 'win32' });
    } catch (error) {
      output = error.stdout; // npm audit exits non-zero when it finds anything
    }
    const { errors, warnings } = evaluate(advisories(JSON.parse(output)), exceptions);
    for (const w of warnings) console.warn(`${dir}: warning: ${w}`);
    for (const e of errors) console.error(`${dir}: BLOCKING: ${e}`);
    console.log(`${dir}: ${errors.length} blocking, ${warnings.length} warnings`);
    failed ||= errors.length > 0;
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
