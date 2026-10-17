import { createApiClient, getHealth } from '../client';

function stubFetch(status: number, body: unknown) {
  return jest.fn(async (input: Request) => {
    expect(input.url).toBe('http://api.test/v1/health');
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof fetch;
}

describe('generated API client', () => {
  it('REQ-PLAT-013 calls GET /v1/health through the generated, typed client', async () => {
    const client = createApiClient(
      'http://api.test',
      stubFetch(200, { status: 'healthy', checks: { database: 'healthy' } }),
    );

    await expect(getHealth(client)).resolves.toEqual({ status: 'healthy', checks: { database: 'healthy' } });
  });

  it('REQ-PLAT-002 returns the body of a 503 as data', async () => {
    const client = createApiClient(
      'http://api.test',
      stubFetch(503, { status: 'unhealthy', checks: { database: 'unhealthy' } }),
    );

    await expect(getHealth(client)).resolves.toMatchObject({ status: 'unhealthy' });
  });
});
