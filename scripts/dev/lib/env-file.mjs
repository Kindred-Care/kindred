// Minimal .env reader so scripts see the same settings as docker compose, without a dependency.
import { existsSync, readFileSync } from 'node:fs';

export function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

/** Process environment wins over .env, as with docker compose. */
export function loadEnv(path = '.env', env = process.env) {
  const fromFile = existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
  return { ...fromFile, ...env };
}
