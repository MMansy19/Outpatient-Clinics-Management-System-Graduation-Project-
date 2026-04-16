import { NextRequest } from 'next/server';

const DEFAULT_BACKEND_API_URL = 'http://127.0.0.1:4000/api/v1';
const DEFAULT_PROXY_TIMEOUT_MS = 120_000;

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

type ProxyRouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = 'force-dynamic';

function getBackendBaseUrl(): string {
  return (process.env.BACKEND_API_URL || DEFAULT_BACKEND_API_URL).trim().replace(/\/+$/, '');
}

function getCandidateBackendBaseUrls(): string[] {
  const primary = getBackendBaseUrl();

  try {
    const url = new URL(primary);
    const candidates = [primary];
    const host = url.hostname;

    const addCandidate = (nextHost: string) => {
      const nextUrl = new URL(primary);
      nextUrl.hostname = nextHost;
      const value = nextUrl.toString().replace(/\/+$/, '');
      if (!candidates.includes(value)) {
        candidates.push(value);
      }
    };

    if (host === '127.0.0.1') {
      addCandidate('localhost');
      addCandidate('::1');
    } else if (host === 'localhost') {
      addCandidate('127.0.0.1');
      addCandidate('::1');
    } else if (host === '::1') {
      addCandidate('127.0.0.1');
      addCandidate('localhost');
    }

    return candidates;
  } catch {
    return [primary];
  }
}

function getProxyTimeoutMs(): number {
  const value = Number(process.env.PROXY_UPSTREAM_TIMEOUT_MS || DEFAULT_PROXY_TIMEOUT_MS);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PROXY_TIMEOUT_MS;
  }
  return value;
}

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'accessToken';

/**
 * Extract the raw JWT from a signed cookie value.
 *
 * Backend sets: `accessToken=s%3A<JWT>.<HMAC>` (cookie-signature format).
 * Steps:
 *  1. URL-decode → `s:<JWT>.<HMAC>`
 *  2. Strip `s:` prefix
 *  3. Remove the trailing `.<HMAC>` (last dot-segment)
 *  4. Return the plain JWT
 *
 * If the cookie is NOT signed (no `s:` prefix) the whole value is returned.
 */
function extractJwtFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  // Parse the cookie header to find AUTH_COOKIE_NAME
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx === -1) continue;
    const name = cookie.substring(0, idx).trim();
    if (name !== AUTH_COOKIE_NAME) continue;

    let value = cookie.substring(idx + 1).trim();
    // URL-decode (e.g. s%3A → s:)
    try { value = decodeURIComponent(value); } catch { /* keep as-is */ }

    if (value.startsWith('s:')) {
      // Signed cookie: s:<JWT>.<HMAC>
      const payload = value.substring(2); // strip "s:"
      const lastDot = payload.lastIndexOf('.');
      // A valid JWT has 3 dot-separated parts (header.payload.signature)
      // The HMAC added by cookie-signature sits after the 3rd "."
      // So we need to find the HMAC boundary = the LAST dot
      if (lastDot === -1) return payload;
      const jwt = payload.substring(0, lastDot);
      // Sanity: a JWT must contain at least 2 dots (3 parts)
      if ((jwt.match(/\./g) || []).length >= 2) return jwt;
      // Fallback: return full payload (maybe unsigned)
      return payload;
    }

    // Not a signed cookie — return as-is (might be a plain JWT)
    if (value && value.includes('.')) return value;
    return null;
  }
  return null;
}

function getForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  const forwardHeader = (name: string) => {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  };

  // Forward only headers needed by the backend and custom tracing headers.
  forwardHeader('accept');
  forwardHeader('content-type');
  forwardHeader('cookie');
  forwardHeader('authorization');

  for (const [name, value] of request.headers.entries()) {
    if (name.startsWith('x-') && value) {
      headers.set(name, value);
    }
  }

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  // If no Authorization header was provided by the client, extract the JWT
  // from the signed cookie and inject it so the backend's passport-jwt
  // strategy can authenticate the request.
  if (!headers.get('authorization')) {
    const cookieHeader = request.headers.get('cookie');
    const jwt = extractJwtFromCookieHeader(cookieHeader);
    // 🔍 DEBUG: Log auth chain for 401 diagnosis (remove after debugging)
    console.log('[PROXY AUTH]', {
      path: request.nextUrl.pathname,
      hasCookie: !!cookieHeader,
      cookieNames: cookieHeader?.split(';').map(c => c.trim().split('=')[0]).join(', ') || 'none',
      jwtExtracted: !!jwt,
      jwtPreview: jwt ? `${jwt.substring(0, 20)}...` : 'null',
    });
    if (jwt) {
      headers.set('authorization', `Bearer ${jwt}`);
    }
  }

  return headers;
}

function getResponseHeaders(upstreamHeaders: Headers): Headers {
  const headers = new Headers();

  // Copy all headers except hop-by-hop
  for (const [name, value] of upstreamHeaders.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      headers.append(name, value);
    }
  }

  // Explicitly forward Set-Cookie headers.
  // Headers.entries() may merge multiple Set-Cookie values into one
  // comma-separated string, which breaks cookies. Use getSetCookie()
  // (available in Node 18.14.1+) to get each cookie individually.
  if (typeof upstreamHeaders.getSetCookie === 'function') {
    headers.delete('set-cookie');
    for (const cookie of upstreamHeaders.getSetCookie()) {
      headers.append('set-cookie', cookie);
    }
  }

  // Helps verify this route handles proxy responses in dev tools.
  headers.set('x-proxy-handler', 'app-route');

  return headers;
}

async function proxyRequest(request: NextRequest, context: ProxyRouteContext): Promise<Response> {
  const resolvedParams = await context.params;
  const path = resolvedParams.path?.join('/') || '';
  const candidateBaseUrls = getCandidateBackendBaseUrls();

  const method = request.method.toUpperCase();
  const headers = getForwardHeaders(request);

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const rawBody = await request.arrayBuffer();
    body = rawBody.byteLength > 0 ? Buffer.from(rawBody) : undefined;
  }

  let lastError: unknown;

  for (const baseUrl of candidateBaseUrls) {
    const targetUrl = `${baseUrl}/${path}${request.nextUrl.search}`;

    try {
      const upstreamResponse = await fetch(targetUrl, {
        method,
        headers,
        body,
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(getProxyTimeoutMs()),
      });

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: getResponseHeaders(upstreamResponse.headers),
      });
    } catch (error) {
      lastError = error;
      const errorName = error instanceof Error ? error.name : '';
      const isTimeout = errorName === 'TimeoutError' || errorName === 'AbortError';

      // Timeout indicates an upstream processing issue, not a host mismatch.
      if (isTimeout) {
        break;
      }
    }
  }

  {
    const error = lastError;
    const errorName = error instanceof Error ? error.name : '';
    const isTimeout = errorName === 'TimeoutError' || errorName === 'AbortError';
    const status = isTimeout ? 504 : 502;
    const statusText = isTimeout ? 'Gateway Timeout' : 'Bad Gateway';
    const rawCause = (error as { cause?: unknown } | undefined)?.cause;
    const cause =
      rawCause && typeof rawCause === 'object'
        ? {
            code: (rawCause as { code?: string }).code,
            errno: (rawCause as { errno?: string | number }).errno,
            address: (rawCause as { address?: string }).address,
            port: (rawCause as { port?: number }).port,
          }
        : undefined;

    console.error('[API Proxy Error]', {
      candidateBaseUrls,
      path,
      method,
      message: error instanceof Error ? error.message : 'Unknown proxy error',
      cause,
    });

    return new Response(statusText, {
      status,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-proxy-handler': 'app-route',
      },
    });
  }
}

export async function GET(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}

export async function HEAD(request: NextRequest, context: ProxyRouteContext) {
  return proxyRequest(request, context);
}
