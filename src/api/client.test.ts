import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bindApiClientAuth, request, ApiError } from './client';

// Reset env and bindings before each test
beforeEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/v1';
  bindApiClientAuth({
    getAccessToken: async () => 'test-token',
    forceRefreshAccessToken: async () => 'refreshed-token',
    handleAuthFailure: vi.fn(),
  });
});

describe('request<T>', () => {
  it('constructs URL with sub-path preserved', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    await request({ method: 'GET', path: '/agents' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/agents',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('skips undefined query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    await request({ method: 'GET', path: '/agents', query: { stage: undefined, active: true } });

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.has('stage')).toBe(false);
    expect(url.searchParams.get('active')).toBe('true');
  });

  it('throws ApiError on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    ));

    await expect(request({ method: 'GET', path: '/missing' })).rejects.toThrow(ApiError);
  });

  it('handles 401 → refresh → 200 happy path', async () => {
    const handleAuthFailure = vi.fn();
    bindApiClientAuth({
      getAccessToken: async () => 'old-token',
      forceRefreshAccessToken: async () => 'new-token',
      handleAuthFailure,
    });

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve(new Response(null, { status: 401 }));
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    }));

    const result = await request({ method: 'GET', path: '/protected' });
    expect(result).toEqual({ ok: true });
    expect(handleAuthFailure).not.toHaveBeenCalled();
  });

  it('handles 401 → refresh → 401 unhappy path', async () => {
    const handleAuthFailure = vi.fn();
    bindApiClientAuth({
      getAccessToken: async () => 'old-token',
      forceRefreshAccessToken: async () => undefined,
      handleAuthFailure,
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    await expect(request({ method: 'GET', path: '/protected' })).rejects.toThrow(ApiError);
    expect(handleAuthFailure).toHaveBeenCalledOnce();
  });

  it('returns undefined for empty 204 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 204, headers: { 'content-length': '0' } })
    ));

    const result = await request({ method: 'DELETE', path: '/agents/123' });
    expect(result).toBeUndefined();
  });
});
