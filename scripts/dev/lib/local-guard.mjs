// Development script safeguards (Section 3, Refinement 4; criterion 14).
//
// Every development and seed script calls assertLocal() before doing anything. It refuses to run
// unless the environment is explicitly local, the database host is on the local allowlist, and no
// cloud credentials for an unlisted AWS account are present. Destructive scripts additionally call
// confirmTyped(). There is no override flag: to run elsewhere, change the allowlist in a reviewed
// pull request.

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const allowlistPath = fileURLToPath(new URL('../allowlist.json', import.meta.url));

export class GuardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GuardError';
  }
}

export function loadAllowlist(path = allowlistPath) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Extracts the host from a Npgsql-style or postgres:// connection string. */
export function databaseHost(connectionString) {
  if (!connectionString) return undefined;
  if (/^postgres(ql)?:\/\//i.test(connectionString)) {
    return new URL(connectionString).hostname.replace(/^\[|\]$/g, '');
  }
  const match = /(?:^|;)\s*(?:host|server)\s*=\s*([^;]+)/i.exec(connectionString);
  return match?.[1].trim();
}

const AWS_CREDENTIAL_VARIABLES = [
  'AWS_PROFILE',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_ACCOUNT_ID',
  'AWS_ROLE_ARN',
  'AWS_WEB_IDENTITY_TOKEN_FILE',
];

/**
 * Throws GuardError unless it is safe to run a development script.
 * @param {{env?: NodeJS.ProcessEnv, databaseConnection?: string, allowlist?: object}} options
 */
export function assertLocal({ env = process.env, databaseConnection, allowlist = loadAllowlist() } = {}) {
  if (env.KINDRED_ENVIRONMENT !== 'Local') {
    throw new GuardError(
      `Refusing to run: KINDRED_ENVIRONMENT is "${env.KINDRED_ENVIRONMENT ?? '(unset)'}", not "Local". ` +
        'Development scripts run only on a local machine (see README).',
    );
  }

  const hosts = [];
  if (databaseConnection !== undefined) hosts.push(databaseHost(databaseConnection));
  if (env.KINDRED_DB_HOST) hosts.push(env.KINDRED_DB_HOST);
  for (const host of hosts) {
    if (!host || !allowlist.databaseHosts.includes(host.toLowerCase())) {
      throw new GuardError(`Refusing to run: database host "${host ?? '(none)'}" is not on the local allowlist.`);
    }
  }

  const awsVariables = AWS_CREDENTIAL_VARIABLES.filter((name) => env[name]);
  if (awsVariables.length > 0) {
    const account = env.AWS_ACCOUNT_ID;
    if (!account || !allowlist.awsAccounts.includes(account)) {
      throw new GuardError(
        `Refusing to run: AWS credentials are present (${awsVariables.join(', ')}) for an account that is not on ` +
          'the development allowlist. Milestone 1 uses no AWS resources; unset them and try again.',
      );
    }
  }
}

/**
 * Asks the operator to type an exact phrase. Anything else aborts.
 * @param {string} phrase
 * @param {{input?: NodeJS.ReadableStream, output?: NodeJS.WritableStream}} io
 */
export async function confirmTyped(phrase, { input = process.stdin, output = process.stdout } = {}) {
  const rl = createInterface({ input, output, terminal: false });
  try {
    const answer = await rl.question(`This is destructive. Type "${phrase}" to continue: `);
    if (answer.trim() !== phrase) {
      throw new GuardError('Confirmation did not match. Nothing was changed.');
    }
  } finally {
    rl.close();
  }
}

/** Runs main() and turns guard failures into a clear message and exit code 2. */
export async function runGuarded(main) {
  try {
    await main();
  } catch (error) {
    if (error instanceof GuardError) {
      console.error(error.message);
      process.exit(2);
    }
    throw error;
  }
}
