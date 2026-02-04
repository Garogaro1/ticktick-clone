/**
 * CORS (Cross-Origin Resource Sharing) utilities.
 *
 * Provides CORS configuration for API routes.
 */

export interface CORSOptions {
  /** Allowed origins (default: same origin) */
  origin?: string | string[] | boolean;
  /** Allowed methods */
  methods?: string[];
  /** Allowed headers */
  headers?: string[];
  /** Allow credentials */
  credentials?: boolean;
  /** Max age for preflight requests (seconds) */
  maxAge?: number;
  /** Exposed headers */
  exposedHeaders?: string[];
}

const defaultOptions: CORSOptions = {
  origin: false, // Same origin only
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Validates if an origin is allowed.
 */
function isOriginAllowed(
  origin: string | undefined,
  allowed: string | string[] | boolean
): boolean {
  if (typeof allowed === 'boolean') {
    return allowed;
  }

  if (typeof allowed === 'string') {
    return origin === allowed;
  }

  if (Array.isArray(allowed)) {
    return allowed.includes(origin || '');
  }

  return false;
}

/**
 * Generates CORS headers for a response.
 *
 * @param origin - The request origin header
 * @param options - CORS configuration options
 * @returns Headers object with CORS directives
 *
 * @example
 * ```ts
 * const headers = getCORSHeaders(request.headers.get('origin'), {
 *   origin: ['https://example.com', 'https://app.example.com'],
 *   credentials: true,
 * });
 * ```
 */
export function getCORSHeaders(
  origin: string | undefined,
  options: CORSOptions = {}
): Record<string, string> {
  const opts = { ...defaultOptions, ...options };
  const headers: Record<string, string> = {};

  // Access-Control-Allow-Origin
  if (typeof opts.origin === 'boolean') {
    if (opts.origin) {
      headers['Access-Control-Allow-Origin'] = '*';
    }
  } else if (typeof opts.origin === 'string') {
    headers['Access-Control-Allow-Origin'] = opts.origin;
  } else if (Array.isArray(opts.origin)) {
    const allowed = isOriginAllowed(origin, opts.origin);
    if (allowed && origin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  // Vary header for origin-specific responses
  if (opts.origin !== '*' && opts.origin !== true) {
    headers['Vary'] = 'Origin';
  }

  // Access-Control-Allow-Credentials
  if (opts.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Access-Control-Expose-Headers
  if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = opts.exposedHeaders.join(', ');
  }

  // Access-Control-Allow-Methods
  if (opts.methods) {
    headers['Access-Control-Allow-Methods'] = opts.methods.join(', ');
  }

  // Access-Control-Allow-Headers
  if (opts.headers) {
    headers['Access-Control-Allow-Headers'] = opts.headers.join(', ');
  }

  // Access-Control-Max-Age
  if (opts.maxAge) {
    headers['Access-Control-Max-Age'] = opts.maxAge.toString();
  }

  return headers;
}

/**
 * Checks if a request is a CORS preflight request.
 */
export function isPreflightRequest(request: Request): boolean {
  return request.method === 'OPTIONS' && request.headers.has('access-control-request-method');
}

/**
 * Handles CORS preflight requests.
 * Returns a Response with appropriate CORS headers.
 */
export function handlePreflightRequest(
  origin: string | undefined,
  options: CORSOptions = {}
): Response {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(origin, options),
  });
}
