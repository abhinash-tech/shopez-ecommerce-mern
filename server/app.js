/**
 * app.js
 *
 * PURPOSE:
 *   Constructs and configures the Express application instance.
 *   This file is the middleware pipeline and routing hub of the server.
 *   It is intentionally kept separate from server.js (which handles the
 *   HTTP server lifecycle) so the app can be imported cleanly in tests
 *   without starting a real server.
 *
 * MIDDLEWARE ORDER (matters — Express applies them top to bottom):
 *
 *   1. CORS                    — Must be first to set headers before any other middleware
 *   2. Security headers        — Helmet, sanitisation, XSS, HPP, compression
 *   3. Cookie parser           — Parses cookies before auth middleware reads them
 *   4. Request logger          — Log BEFORE body parsing so we capture all requests
 *   5. Raw body (Stripe)       — Must be BEFORE express.json() for webhook verification
 *   6. JSON body parser        — Parse JSON request bodies
 *   7. URL-encoded parser      — Parse form submissions
 *   8. Global rate limiter     — Applied after parsing but before routing
 *   9. API routes              — All /api/v1/* routes
 *  10. Not-found handler       — Catches unmatched routes (runs after all routes)
 *  11. Global error handler    — Must be LAST (4-argument Express error handler)
 *
 * EXPORTS:
 *   app — The configured Express Application instance.
 *         Imported by server.js to attach to an HTTP server.
 */

'use strict';

// ── Load environment variables FIRST ─────────────────────────────────────────
// dotenv must be called before any other module that reads process.env.
// config/env.js validates all required variables after dotenv populates them.
require('dotenv').config();
require('./config/env'); // Throws immediately if any required var is missing

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const corsOptions = require('./config/corsOptions');
const applySecurityMiddleware = require('./middlewares/security');
const requestLogger = require('./middlewares/requestLogger');
const { globalLimiter } = require('./middlewares/rateLimiter');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const apiRouter = require('./routes/index');
const logger = require('./utils/logger');

// ── Create Express Application ────────────────────────────────────────────────
const app = express();

// ── Trust Proxy ───────────────────────────────────────────────────────────────
// Tells Express to trust the X-Forwarded-For header from proxies (Nginx, Heroku,
// Railway, Render). This ensures req.ip contains the real client IP, not the
// proxy's IP. Without this, rate limiting keyed on req.ip would block the
// proxy rather than the actual clients.
//
// '1' = trust the first proxy in the chain.
// In production, set this to the number of proxies in front of the server.
app.set('trust proxy', 1);

// ── Middleware Pipeline ───────────────────────────────────────────────────────

// 1. CORS — Must run before anything else to set preflight headers.
app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight requests for all routes.
app.options('*', cors(corsOptions));

// 2. Security middleware bundle (Helmet, mongoSanitize, xss-clean, HPP, compression)
applySecurityMiddleware(app);

// 3. Cookie parser — Parses the Cookie header and populates req.cookies.
//    The refresh token is stored in an httpOnly cookie and read here.
app.use(cookieParser());

// 4. HTTP request logger (Morgan → Winston)
app.use(requestLogger);

// 5. Raw body parser for Stripe webhook endpoint.
//    Stripe signature verification requires the raw request body buffer.
//    This MUST be mounted before express.json() because express.json()
//    replaces the raw body with a parsed object.
//    The raw body is stored on req.rawBody for the webhook handler to access.
app.use(
  '/api/v1/payments/webhook',
  express.raw({
    type: 'application/json',
    verify: (req, res, buf) => {
      req.rawBody = buf; // Store for Stripe signature verification
    },
  })
);

// 6. JSON body parser — Parses application/json request bodies.
//    Limits body size to 10kb to prevent large payload DoS.
app.use(
  express.json({
    limit: '10kb',
    // Strict: true (default) — rejects non-array/non-object JSON top-level values.
    strict: true,
  })
);

// 7. URL-encoded body parser — Parses application/x-www-form-urlencoded bodies.
//    extended: false = uses the native querystring module (simpler, no nested objects).
//    extended: true  = uses the qs module (supports nested objects).
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 8. Global rate limiter — Applied to all routes.
//    Auth-specific and upload-specific limiters are applied at the route level.
app.use(globalLimiter);

// ── Static Files ──────────────────────────────────────────────────────────────
// Serve uploaded files from the local /uploads directory (development only).
// In production, files are served from Cloudinary CDN directly.
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ── API Routes ────────────────────────────────────────────────────────────────
// All API routes are prefixed with /api/v1/.
// The router in routes/index.js handles all sub-routing.
app.use('/api/v1', apiRouter);

// ── Root Route (sanity check) ─────────────────────────────────────────────────
// Returns a simple welcome message for the root URL.
// Useful for confirming the server is running when visiting via browser.
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ShopEZ API Server is running. Visit /api/v1/health for status.',
    docs: '/api/v1/health',
    version: 'v1',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
// Catches all requests that didn't match any route above.
// Must come AFTER all route definitions.
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be the LAST middleware in the stack.
// Express identifies it as an error handler by its 4-argument signature.
app.use(errorHandler);

// ── App Startup Log ───────────────────────────────────────────────────────────
logger.info(`📦  Express app configured. Environment: ${process.env.NODE_ENV}`);

module.exports = app;
