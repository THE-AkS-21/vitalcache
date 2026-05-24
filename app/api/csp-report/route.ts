/**
 * Route Handler: POST /api/csp-report
 *
 * Receives Content-Security-Policy violation reports from the browser.
 * The Content-Security-Policy-Report-Only header in next.config.mjs sends
 * violation data here via the `report-uri` directive.
 *
 * In development/staging: logs to console for quick feedback.
 * In production: forward to your observability stack (Datadog, Sentry, etc.)
 *
 * CSP report body format (W3C spec):
 * {
 *   "csp-report": {
 *     "document-uri": "https://app.vitalcache.com/dashboard",
 *     "violated-directive": "script-src",
 *     "blocked-uri": "https://evil.com/xss.js",
 *     ...
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

interface CspReport {
  'document-uri'?: string;
  'violated-directive'?: string;
  'blocked-uri'?: string;
  'original-policy'?: string;
  disposition?: string;
  referrer?: string;
  'script-sample'?: string;
  'status-code'?: number;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
}

interface CspReportBody {
  'csp-report': CspReport;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CspReportBody;
    const report = body['csp-report'];

    // Structured JSON log to stdout — the Next.js container forwards stdout
    // to whatever log aggregator is configured (CloudWatch, Datadog, Loki, etc.).
    // Fields match the OpenTelemetry Logs Data Model so log aggregators can
    // parse them without custom extractors.
    const logEntry = {
      timestamp: new Date().toISOString(),
      severity: 'WARN',
      name: 'csp_violation',
      body: {
        violated_directive: report['violated-directive'],
        blocked_uri: report['blocked-uri'],
        document_uri: report['document-uri'],
        source_file: report['source-file'],
        line: report['line-number'],
        column: report['column-number'],
        disposition: report.disposition,
      },
    };
    // Use process.stdout.write for structured JSON — avoids console.warn
    // prepending a human-readable timestamp that breaks JSON log parsers.
    process.stdout.write(JSON.stringify(logEntry) + '\n');

    // 204 No Content — browser doesn’t need a response body
    return new NextResponse(null, { status: 204 });
  } catch {
    // Malformed report body — silently discard
    return new NextResponse(null, { status: 204 });
  }
}
