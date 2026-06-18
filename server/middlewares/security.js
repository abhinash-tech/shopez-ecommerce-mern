/**
 * middlewares/security.js
 *
 * PURPOSE:
 *   Applies a suite of HTTP security hardening middlewares to the Express app.
 *   Exports a single `applySecurityMiddleware(app)` function called once in
 *   app.js during application bootstrapping.
 *
 * MIDDLEWARES APPLIED (in order):
 *
 *   1. helmet()          — Sets secure HTTP response headers:
 *                          Content-Security-Policy, X-Content-Type-Options,
 *                          X-Frame-Options, Strict-Transport-Security,
 *                          Referrer-Policy, Permissions-Policy, etc.
 *
 *   2. mongoSanitize()   — Strips MongoDB operator characters ($ and .)
 *                          from req.body, req.params, req.query.
 *                          Prevents NoSQL injection attacks.
 *
 *   3. xss-clean         — Strips HTML/script tags from user input.
 *                          Prevents stored XSS through user-supplied content.
 *
 *   4. hpp()             — Removes duplicate query string parameters.
 *                          Prevents HTTP parameter pollution attacks.
 *                          e.g. ?sort=name&sort=price → only first is kept.
 *
 *   5. compression()     — Gzip-compresses HTTP responses for text content.
 *                          Significantly reduces response payload sizes.
 *
 * NOTES:
 *   - CORS is applied in app.js before this function, not here, because
 *     CORS must run before any body parsing.
 *   - The Stripe webhook route MUST be registered BEFORE express.json()
 *     because it requires the raw request body buffer for signature verification.
 *   - helmet's Content-Security-Policy is configured to allow the frontend
 *     origin in the `connect-src` directive.
 */

'use strict';

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const config = require('../config/env');

/**
 * Applies all security middlewares to the given Express app instance.
 *
 * @param {import('express').Application} app - The Express app instance
 */
function applySecurityMiddleware(app) {
  // ── 1. Helmet — Secure HTTP Headers ────────────────────────────────────
  app.use(
    helmet({
      // Content-Security-Policy: Restricts where resources can be loaded from.
      // Configured to allow the frontend origin and common CDN sources.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          connectSrc: ["'self'", config.CLIENT_URL],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: config.IS_PROD ? [] : null,
        },
      },
      // Cross-Origin-Resource-Policy: blocks cross-origin reads of resources.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // X-Frame-Options: prevents clickjacking by disallowing iframes.
      frameguard: { action: 'deny' },
      // X-Content-Type-Options: prevents MIME type sniffing.
      noSniff: true,
      // Strict-Transport-Security: forces HTTPS for 1 year (production only).
      hsts: config.IS_PROD
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      // Referrer-Policy: controls how much referrer info is sent.
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  // ── 2. MongoDB Sanitisation — Prevent NoSQL Injection ──────────────────
  // Removes keys that start with '$' or contain '.' from req.body,
  // req.params, and req.query. Essential for preventing MongoDB operator
  // injection like: { "email": { "$gt": "" } }
  app.use(
    mongoSanitize({
      replaceWith: '_',  // Replace bad chars with '_' instead of deleting the field
      onSanitize: ({ req, key }) => {
        console.warn(`⚠️  Sanitised request field '${key}' from ${req.ip}`);
      },
    })
  );

  // ── 3. XSS Clean — Prevent Cross-Site Scripting ────────────────────────
  // Sanitises user input in req.body, req.query, and req.params by
  // escaping HTML tags and script elements.
  // e.g. "<script>alert('xss')</script>" → "&lt;script&gt;..."
  app.use(xss());

  // ── 4. HPP — HTTP Parameter Pollution Prevention ───────────────────────
  // Prevents abuse via duplicate query parameters.
  // Whitelist allows legitimate multi-value params (e.g. ?ids[]=1&ids[]=2).
  app.use(
    hpp({
      whitelist: [
        'ids',        // Allow multiple IDs: ?ids[]=xxx&ids[]=yyy
        'tags',       // Allow multiple tags: ?tags[]=electronics&tags[]=sale
        'status',     // Allow multiple statuses: ?status[]=placed&status[]=shipped
        'category',   // Allow multiple category filters
      ],
    })
  );

  // ── 5. Compression — Gzip Response Compression ─────────────────────────
  // Compresses all text-based responses (JSON, HTML, CSS, JS).
  // Skips compression for small responses (<1KB) where overhead > savings.
  app.use(
    compression({
      // Only compress responses > 1KB
      threshold: 1024,
      // Compression level: 6 is a good balance between speed and compression ratio.
      // Level 9 = maximum compression but much slower; Level 1 = fastest but least compression.
      level: 6,
      // Only compress these content types
      filter: (req, res) => {
        // Don't compress responses if 'x-no-compression' header is set (useful for debugging)
        if (req.headers['x-no-compression']) return false;
        // Use the standard compression filter for everything else
        return compression.filter(req, res);
      },
    })
  );
}

module.exports = applySecurityMiddleware;
