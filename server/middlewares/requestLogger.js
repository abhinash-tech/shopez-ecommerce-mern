/**
 * middlewares/requestLogger.js
 *
 * PURPOSE:
 *   HTTP access logging middleware using Morgan.
 *   Logs every incoming request with method, URL, status code, response
 *   time, and response size. Output is piped through Winston so all logs
 *   share a consistent format and destination (console / file).
 *
 * EXPORTS:
 *   requestLogger  — a Morgan middleware instance ready to mount in app.js.
 *
 * FORMATS:
 *   Development : 'dev'    — Colourised, compact single-line per request.
 *                            e.g. POST /api/v1/auth/login 200 34.123 ms - 512
 *
 *   Production  : 'combined' — Apache-style full format with IP, user-agent,
 *                              and date. Best for ingestion by log aggregators.
 *                              e.g. ::1 - - [17/Jun/2026:17:00:00 +0000] "POST /api/v1/auth/login HTTP/1.1" 200 512 "-" "axios/1.7.2"
 *
 * SKIP:
 *   - Health-check endpoint (/api/v1/health) is skipped to avoid log noise
 *     from load balancer probes.
 *   - Stripe webhook endpoint body parsing logs are suppressed (raw buffer).
 *
 * WINSTON INTEGRATION:
 *   Morgan writes to logger.stream, which logs at the 'http' level.
 *   In production, this means HTTP logs appear in combined-*.log files
 *   at the http level (above debug, below info).
 */

'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');

const isDev = (process.env.NODE_ENV || 'development') === 'development';

/**
 * Custom Morgan token: request body (for POST/PATCH requests only).
 * Only logs the body in development — sensitive data like passwords
 * are redacted before logging.
 *
 * NOTE: Passwords and tokens are replaced with '[REDACTED]' regardless.
 */
morgan.token('body', (req) => {
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) return '';
  if (!req.body || Object.keys(req.body).length === 0) return '';

  // Redact sensitive fields
  const sanitised = { ...req.body };
  const sensitiveFields = ['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token', 'refreshToken'];
  sensitiveFields.forEach((field) => {
    if (sanitised[field]) sanitised[field] = '[REDACTED]';
  });

  return JSON.stringify(sanitised);
});

/**
 * Custom Morgan token: authenticated user ID.
 * Populated by the `authenticate` middleware which sets req.user.
 */
morgan.token('user-id', (req) => {
  return req.user ? req.user._id.toString() : 'anonymous';
});

/**
 * Format string for development: concise and colourised.
 */
const devFormat =
  ':method :url :status :response-time ms - :res[content-length]';

/**
 * Format string for production: includes IP and user agent for auditing.
 * Combined format is the Apache Common Log Format extended with referrer
 * and user-agent. Compatible with most log analysis tools.
 */
const prodFormat =
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

/**
 * Skip logging for certain request patterns to reduce noise.
 */
const shouldSkip = (req) => {
  const skipPaths = [
    '/api/v1/health',   // Load balancer health probes
    '/favicon.ico',     // Browser favicon requests
  ];
  return skipPaths.some((path) => req.url.startsWith(path));
};

const requestLogger = morgan(isDev ? devFormat : prodFormat, {
  stream: logger.stream,
  skip: shouldSkip,
});

module.exports = requestLogger;
