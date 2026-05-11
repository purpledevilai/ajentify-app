export interface RequestInput<TBody = unknown> {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true, the 401 interceptor is bypassed. Used by auth endpoints. */
  skipAuthInterceptor?: boolean;
}

export interface ApiClientAuthBindings {
  getAccessToken: () => Promise<string | undefined>;
  forceRefreshAccessToken: () => Promise<string | undefined>;
  handleAuthFailure: () => Promise<void>;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// Module-level binding refs — set by bindApiClientAuth, never imported from a store directly
let authBindings: ApiClientAuthBindings | null = null;

/** Called once during app boot from (authenticated)/providers.tsx — render-time, synchronous */
export function bindApiClientAuth(bindings: ApiClientAuthBindings): void {
  authBindings = bindings;
}

/** Returns the current access token via the bound auth provider. */
export async function getAccessToken(): Promise<string | undefined> {
  return authBindings?.getAccessToken();
}

/** The single function every src/api/**\/*.ts file calls */
export async function request<TResponse, TBody = unknown>(
  input: RequestInput<TBody>
): Promise<TResponse> {
  return executeRequest<TResponse, TBody>(input, false);
}

async function executeRequest<TResponse, TBody>(
  input: RequestInput<TBody>,
  isRetry: boolean
): Promise<TResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  const trimmedBase = base.replace(/\/$/, '');
  const normalizedPath = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const url = new URL(`${trimmedBase}${normalizedPath}`);

  // Append query params, skipping undefined values
  if (input.query) {
    for (const [k, v] of Object.entries(input.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (!(input.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Auth header — only if bindings are set and token is available
  if (authBindings) {
    const token = await authBindings.getAccessToken();
    if (token) headers['Authorization'] = token;
  }

  // Merge caller-provided headers last (allow override)
  if (input.headers) {
    Object.assign(headers, input.headers);
  }

  // Body
  const body =
    input.body instanceof FormData
      ? input.body
      : input.body !== undefined
      ? JSON.stringify(input.body)
      : undefined;

  const response = await fetch(url.toString(), {
    method: input.method,
    headers,
    body,
    signal: input.signal,
  });

  // 401 handling
  if (response.status === 401 && !input.skipAuthInterceptor && authBindings) {
    if (!isRetry) {
      // First 401: try to refresh token and retry once
      await authBindings.forceRefreshAccessToken();
      return executeRequest<TResponse, TBody>(input, true);
    } else {
      // Second 401: auth failure
      const errorBody = await parseBody(response);
      await authBindings.handleAuthFailure();
      throw new ApiError(401, 'Unauthorized', errorBody);
    }
  }

  // Non-2xx
  if (!response.ok) {
    const errorBody = await parseBody(response);
    const message =
      (errorBody && typeof errorBody === 'object' && 'error' in errorBody && typeof (errorBody as Record<string, unknown>).error === 'string')
        ? (errorBody as Record<string, unknown>).error as string
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorBody);
  }

  // 2xx with empty body (e.g. DELETE 204)
  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type') ?? '';
  if (contentLength === '0' || (!contentType.includes('application/json') && response.status === 204)) {
    return undefined as TResponse;
  }

  // Try to parse as JSON, fall back to text
  const text = await response.text();
  if (!text) return undefined as TResponse;
  try {
    return JSON.parse(text) as TResponse;
  } catch {
    return text as unknown as TResponse;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}
