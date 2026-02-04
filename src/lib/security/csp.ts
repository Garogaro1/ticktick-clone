/**
 * Content Security Policy (CSP) utilities.
 *
 * Generates CSP headers for XSS protection.
 */

export interface CSPConfig {
  /** Default source for content */
  defaultSrc?: string[];
  /** Script sources */
  scriptSrc?: string[];
  /** Style sources */
  styleSrc?: string[];
  /** Image sources */
  imgSrc?: string[];
  /** Connect sources (fetch, XMLHttpRequest, etc.) */
  connectSrc?: string[];
  /** Font sources */
  fontSrc?: string[];
  /** Object sources */
  objectSrc?: string[];
  /** Media sources */
  mediaSrc?: string[];
  /** Frame sources */
  frameSrc?: string[];
  /** Worker sources */
  workerSrc?: string[];
  /** Base URI */
  baseUri?: string[];
  /** Form action */
  formAction?: string[];
  /** Frame ancestors */
  frameAncestors?: string[];
  /** Report URI for CSP violations */
  reportUri?: string;
  /** Report-only mode (doesn't block, only reports) */
  reportOnly?: boolean;
}

const defaultCSPConfig: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
  workerSrc: ["'self'", 'blob:'],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
};

/**
 * Generates a CSP directive string.
 */
function generateDirective(values: string[]): string {
  return values.join(' ');
}

/**
 * Generates a complete CSP header value.
 *
 * @param config - CSP configuration
 * @returns CSP header value string
 *
 * @example
 * ```ts
 * const cspHeader = generateCSPHeader({
 *   scriptSrc: ["'self'", "https://analytics.example.com"],
 *   imgSrc: ["'self'", "data:", "https:"],
 * });
 * ```
 */
export function generateCSPHeader(config: CSPConfig = {}): string {
  const csp = { ...defaultCSPConfig, ...config };

  const directives: string[] = [];

  if (csp.defaultSrc) {
    directives.push(`default-src ${generateDirective(csp.defaultSrc)}`);
  }
  if (csp.scriptSrc) {
    directives.push(`script-src ${generateDirective(csp.scriptSrc)}`);
  }
  if (csp.styleSrc) {
    directives.push(`style-src ${generateDirective(csp.styleSrc)}`);
  }
  if (csp.imgSrc) {
    directives.push(`img-src ${generateDirective(csp.imgSrc)}`);
  }
  if (csp.connectSrc) {
    directives.push(`connect-src ${generateDirective(csp.connectSrc)}`);
  }
  if (csp.fontSrc) {
    directives.push(`font-src ${generateDirective(csp.fontSrc)}`);
  }
  if (csp.objectSrc) {
    directives.push(`object-src ${generateDirective(csp.objectSrc)}`);
  }
  if (csp.mediaSrc) {
    directives.push(`media-src ${generateDirective(csp.mediaSrc)}`);
  }
  if (csp.frameSrc) {
    directives.push(`frame-src ${generateDirective(csp.frameSrc)}`);
  }
  if (csp.workerSrc) {
    directives.push(`worker-src ${generateDirective(csp.workerSrc)}`);
  }
  if (csp.baseUri) {
    directives.push(`base-uri ${generateDirective(csp.baseUri)}`);
  }
  if (csp.formAction) {
    directives.push(`form-action ${generateDirective(csp.formAction)}`);
  }
  if (csp.frameAncestors) {
    directives.push(`frame-ancestors ${generateDirective(csp.frameAncestors)}`);
  }
  if (csp.reportUri) {
    directives.push(`report-uri ${csp.reportUri}`);
  }

  // Add report-to directive if using reporting API
  if (csp.reportUri) {
    directives.push(`report-to csp-endpoint`);
  }

  return directives.join('; ');
}

/**
 * Gets CSP header name based on report-only mode.
 */
export function getCSPHeaderName(reportOnly?: boolean): string {
  return reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
}

/**
 * Generates CSP headers object for Next.js config or middleware.
 *
 * @param config - CSP configuration
 * @returns Object with CSP header name and value
 *
 * @example
 * ```ts
 * // In next.config.js
 * const { generateCSPHeaders } = await import('@/lib/security/csp');
 * module.exports = {
 *   async headers() {
 *     return [{
 *       source: '/:path*',
 *       headers: generateCSPHeaders(),
 *     }];
 *   },
 * };
 * ```
 */
export function generateCSPHeaders(config: CSPConfig = {}): Record<string, string> {
  const headerValue = generateCSPHeader(config);
  const headerName = getCSPHeaderName(config.reportOnly);

  return {
    [headerName]: headerValue,
  };
}

/**
 * Creates a nonce for inline scripts/styles.
 * In Next.js, use `headers().get('x-nonce')` to get the server-generated nonce.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSP configuration for development (more permissive).
 */
export const developmentCSPConfig: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:3000'],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'localhost:3000'],
  connectSrc: ["'self'", 'localhost:3000', 'ws://localhost:3000'],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
  workerSrc: ["'self'", 'blob:'],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
};

/**
 * CSP configuration for production (strict).
 */
export const productionCSPConfig: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled-jsx and similar
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
  workerSrc: ["'self'", 'blob:'],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
};
