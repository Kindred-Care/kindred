import createClient from 'openapi-fetch';

import { config } from '@/lib/config';
import type { paths, SchemaHealthResponse } from './generated/schema';

/**
 * Thin hand-written wrapper over the generated client (Section 3, Refinement 2). The types in
 * ./generated come from docs/api/openapi.json and are never edited. Phase 2 adds the auth header,
 * the organization route segment, error mapping, idempotency keys and the query-key factory here.
 */
export function createApiClient(baseUrl: string = config.apiBaseUrl, fetchImpl?: typeof fetch) {
  return createClient<paths>({ baseUrl, fetch: fetchImpl });
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** GET /v1/health. A 503 still carries a health body, so both are returned as data. */
export async function getHealth(client: ApiClient): Promise<SchemaHealthResponse> {
  const { data, error } = await client.GET('/v1/health');
  const body = data ?? error;
  if (!body) {
    throw new Error('The health check returned no body.');
  }
  return body;
}
