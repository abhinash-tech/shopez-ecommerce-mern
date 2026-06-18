/**
 * middlewares/rateLimiter.js
 *
 * PURPOSE:
 *   Rate limiting middleware using `express-rate-limit`.
 *   Protects endpoints against brute-force attacks, credential stuffing,
 *   and abuse. Multiple limiters with different thresholds are exported
 *   for use on different route groups.
 *
 * EXPORTS:
 *   globalLimiter     — Applied to ALL routes (100 req / 15 min per IP)
 *   authLimiter       — Applied to auth routes only (10 req / 15 min per IP)
 *   uploadLimiter     — Applied to file upload routes (20 req / 1 hr per user)
 *   searchLimiter     — Applied to search endpoint (30 req / 1 min per IP)
 *   adminLimiter      — Applied to admin routes (200 req / 15 min per IP)
 *
 * STORAGE:
 *   Uses the default in-memory store (MemoryStore). This is fine for single-
 *   process deployments. For multi-process / multi-instance deployments
 *   (PM2 clusters, Kubernetes), replace with a Redis store:
 *
 *     const RedisStore = require('rate-limit-redis');
 *     store: new RedisStore({ client: redisClient, prefix: 'rl:' })
 *
 *   The store option can be swapped without changing any other code.
 *
 * STANDARD HEADERS:
 *   Sends `RateLimit-*` headers (IETF draft standard) so clients know
 *   their current limit, remaining requests, and reset time:
 *     RateLimit-Policy: 100;w=900
 *     RateLimit-Limit: 100
 *     RateLimit-Remaining: 87
 *     RateLimit-Reset: 1718649600
 *
 * RESPONSE ON LIMIT EXCEEDED:
 *   Returns HTTP 429 with the standard ShopEZ error envelope:
 *   { "success": false, "message": "...", "code": "RATE_LIMIT_EXCEEDED" }
 */

'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Factory function that creates a limiter with merged options.
 * All limiters share the same response handler and header format.
 *
 * @param {object} options - express-rate-limit options to merge with defaults
 * @returns {Function}       Express middleware function
 */
function createLimiter(options) {
  return rateLimit({
    // ── Defaults ──────────────────────────────────────────────────────────
    windowMs: config.RATE_LIMIT_WINDOW_MS,  // 15 minutes
    max: config.RATE_LIMIT_MAX,             // 100 per window
    standardHeaders: 'draft-7',             // RateLimit-* headers (IETF draft-7)
    legacyHeaders: false,                   // Disable X-RateLimit-* (legacy)

    // ── Key Generator ─────────────────────────────────────────────────────
    // Key is the client's IP address by default. For authenticated routes,
    // you can override this to use req.user._id for per-user limiting.
    keyGenerator: (req) => req.ip,

    // ── Rate Limit Exceeded Handler ────────────────────────────────────────
    // Returns our standard error envelope instead of express-rate-limit's
    // default plain text response.
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message:
          'Too many requests from this IP address. Please wait before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000), // seconds until reset
      });
    },

    // ── Skip Successful Requests ───────────────────────────────────────────
    // Only count failed (4xx/5xx) requests toward the limit.
    // Useful for auth routes: successful logins don't eat into the limit.
    // Disable this on routes where you want to count ALL requests.
    skipSuccessfulRequests: false,

    // ── Skip Failed Requests ───────────────────────────────────────────────
    skipFailedRequests: false,

    // Merge caller-provided options (overrides defaults above)
    ...options,
  });
}

// ── Limiter Configurations ────────────────────────────────────────────────────

/**
 * Global limiter: applied to every route.
 * A broad safety net against general abuse.
 * 100 requests per 15 minutes per IP.
 */
const globalLimiter = createLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,  // 15 min
  max: config.RATE_LIMIT_MAX,             // 100
  message: 'Too many requests. Please slow down.',
});

/**
 * Auth limiter: applied to login, register, forgot-password, reset-password.
 * Much stricter to prevent brute-force and credential stuffing.
 * 10 requests per 15 minutes per IP.
 * skipSuccessfulRequests: true → Only failed auth attempts count.
 * (A real user logging in successfully doesn't burn through the limit.)
 */
const authLimiter = createLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,  // 15 min
  max: config.AUTH_RATE_LIMIT_MAX,        // 10
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Too many authentication attempts. Please wait 15 minutes before trying again.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * Upload limiter: applied to image upload endpoints.
 * Prevents DoS through repeated large file uploads.
 * 20 uploads per hour per IP.
 */
const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Upload limit reached. You can upload at most 20 files per hour.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * Search limiter: applied to GET /products (full-text search heavy endpoint).
 * 30 requests per minute per IP.
 */
const searchLimiter = createLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests. Please wait a moment.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * Admin limiter: higher threshold for admin panel operations.
 * 200 requests per 15 minutes per IP.
 */
const adminLimiter = createLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,  // 15 min
  max: 200,
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  adminLimiter,
};
