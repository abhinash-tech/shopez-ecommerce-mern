/**
 * config/corsOptions.js
 *
 * PURPOSE:
 *   Configures Cross-Origin Resource Sharing (CORS) for the Express server.
 *   Controls which frontend origins may make requests to the API,
 *   which HTTP methods and headers are allowed, and whether cookies
 *   (credentials) are included in cross-origin requests.
 *
 * EXPORTS:
 *   corsOptions  — Options object passed directly to the `cors` npm package.
 *
 * DESIGN DECISIONS:
 *   - In development, the single CLIENT_URL (Vite dev server) is allowed.
 *   - In production, a whitelist array allows multiple known origins
 *     (e.g., the main site + admin subdomain + mobile web view).
 *   - `credentials: true` is required for the httpOnly refresh token cookie
 *     to be sent cross-origin. The frontend must also set
 *     `axios.defaults.withCredentials = true`.
 *   - The `optionsSuccessStatus: 200` setting fixes a bug in older IE/Edge
 *     versions that treat 204 (the default preflight response) as an error.
 *   - Exact origin matching (not wildcard) is enforced because `credentials: true`
 *     is incompatible with `origin: '*'`.
 */

'use strict';

const config = require('./env');
const logger = require('../utils/logger');

/**
 * Allowed origins list.
 *   Development : only the Vite dev server.
 *   Production  : extend this array with all known frontend URLs.
 */
const ALLOWED_ORIGINS =
  config.IS_PROD
    ? [
        config.CLIENT_URL,            // e.g. https://shopez.com
        // 'https://admin.shopez.com',
        // 'https://vendor.shopez.com',
      ]
    : [
        config.CLIENT_URL,            // e.g. http://localhost:5173
        'http://localhost:3000',      // Alternative React dev port
        'http://localhost:4173',      // Vite preview port
      ];

/**
 * Dynamic origin check function.
 * Called by the `cors` package for every incoming request.
 * Allows the origin if it is in ALLOWED_ORIGINS, rejects it otherwise.
 *
 * @param {string|undefined} origin  - The request's Origin header value.
 *                                     Undefined for same-origin requests and
 *                                     server-to-server calls (e.g., Stripe webhooks).
 * @param {Function}         callback - Node-style callback(error, allow).
 */
function originAllowed(origin, callback) {
  // Allow requests with no origin header:
  //   - Server-to-server calls (Stripe webhook, cron jobs)
  //   - Requests from tools like Postman / curl
  //   - Same-origin requests (browser calling its own origin)
  if (!origin) {
    return callback(null, true);
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    return callback(null, true);
  }

  logger.warn(`🚫  CORS blocked origin: ${origin}`);
  return callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
}

const corsOptions = {
  /**
   * origin: function — enables per-request dynamic origin validation.
   * Alternatively, you can use a string ('http://localhost:5173') or
   * an array ([...]) for static configuration.
   */
  origin: originAllowed,

  /**
   * credentials: true — allows the browser to send and receive cookies
   * in cross-origin requests. Required for the httpOnly refresh token cookie.
   * Cannot be used with `origin: '*'`.
   */
  credentials: true,

  /**
   * methods — explicitly list accepted HTTP verbs.
   * OPTIONS is required for pre-flight requests.
   */
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * allowedHeaders — headers the browser is permitted to include in requests.
   * Authorization is required for Bearer token transmission.
   * Content-Type is required for JSON bodies.
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  /**
   * exposedHeaders — response headers the browser JS can access.
   * X-Total-Count lets the frontend read pagination totals from the header
   * without having to parse the response body first.
   */
  exposedHeaders: ['X-Total-Count'],

  /**
   * maxAge — seconds the browser caches the pre-flight OPTIONS response.
   * 86400 = 24 hours; reduces pre-flight request overhead in production.
   */
  maxAge: 86400,

  /**
   * optionsSuccessStatus: 200 — some browsers (old IE/Edge) reject 204
   * as a pre-flight success. Using 200 is safer.
   */
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
