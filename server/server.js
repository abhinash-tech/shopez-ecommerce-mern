/**
 * server.js
 *
 * PURPOSE:
 *   The application entry point. Responsible for:
 *     1. Connecting to MongoDB
 *     2. Creating the HTTP server
 *     3. Starting the HTTP listener on the configured port
 *     4. Handling unhandled Promise rejections and uncaught exceptions
 *        to guarantee graceful shutdown in all failure scenarios
 *
 * SEPARATION OF CONCERNS:
 *   This file only manages the HTTP server lifecycle.
 *   All Express configuration (middleware, routes) lives in app.js.
 *   All database logic lives in config/db.js.
 *
 *   This separation allows app.js to be imported in tests without
 *   starting a real server or opening a real database connection.
 *
 * STARTUP SEQUENCE:
 *   1. Load environment variables via dotenv (happens inside app.js)
 *   2. Connect to MongoDB (connectDB)
 *   3. Create HTTP server from Express app
 *   4. Start listening on PORT
 *   5. Register process-level error and signal handlers
 *
 * GRACEFUL SHUTDOWN:
 *   On SIGTERM or SIGINT:
 *     - HTTP server stops accepting new connections
 *     - Existing connections are allowed to complete (server.close())
 *     - MongoDB connection is closed (handled in config/db.js)
 *     - Process exits cleanly with code 0
 *
 *   On uncaught exception or unhandled rejection:
 *     - Error is logged with full stack trace
 *     - Server closes gracefully
 *     - Process exits with code 1
 *     - A process manager (PM2, Kubernetes) should restart the process
 */

'use strict';

require('dotenv').config();
require('./config/env'); // Validates env vars immediately on startup

const http = require('http');
const app = require('./app');           // Express application
const connectDB = require('./config/db'); // MongoDB connection manager
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

/**
 * Main startup function.
 * Using async IIFE (Immediately Invoked Function Expression) lets us use
 * `await` at the top level without needing a separate async main() call.
 */
(async () => {
  // ── Step 1: Connect to MongoDB ─────────────────────────────────────────
  // connectDB() throws and exits (process.exit(1)) on connection failure,
  // so the HTTP server is only started if the database is reachable.
  await connectDB();

  // ── Step 2: Create HTTP Server ────────────────────────────────────────
  // Wrapping the Express app in http.createServer() gives us direct access
  // to the server instance for graceful shutdown (server.close()) and for
  // future WebSocket support (socket.io attaches to the http.Server).
  const server = http.createServer(app);

  // ── Step 3: Configure HTTP Server Settings ────────────────────────────
  // Timeout for idle keep-alive connections (default is 5000ms in Node.js 18+).
  // Set to 65 seconds so connections outlive AWS ALB / Nginx default timeouts.
  server.keepAliveTimeout = 65000;
  // Header timeout must be greater than keepAliveTimeout.
  server.headersTimeout = 66000;

  // ── Step 4: Start Listening ───────────────────────────────────────────
  server.listen(PORT, () => {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`🚀  ShopEZ API Server started`);
    logger.info(`   Environment : ${NODE_ENV}`);
    logger.info(`   Port        : ${PORT}`);
    logger.info(`   API Base    : http://localhost:${PORT}/api/v1`);
    logger.info(`   Health      : http://localhost:${PORT}/api/v1/health`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  // ── Step 5: Graceful Shutdown Function ────────────────────────────────
  /**
   * Stops the HTTP server gracefully, allowing in-flight requests to complete
   * before closing the process. Called by signal handlers and error handlers.
   *
   * @param {string} reason - Human-readable reason for shutdown (for logging)
   * @param {number} code   - Process exit code (0 = clean, 1 = error)
   */
  function gracefulShutdown(reason, code = 0) {
    logger.info(`\n🛑  Graceful shutdown initiated: ${reason}`);

    server.close((err) => {
      if (err) {
        logger.error(`❌  Error during server.close(): ${err.message}`);
        process.exit(1);
      }
      logger.info('✅  HTTP server closed. All connections drained.');
      // MongoDB connection is closed by the SIGTERM handler in config/db.js
      process.exit(code);
    });

    // Force-kill after 30 seconds if graceful shutdown hangs
    // (e.g., a long-running request or a zombie connection)
    setTimeout(() => {
      logger.error('⚠️  Graceful shutdown timeout (30s). Forcing exit.');
      process.exit(1);
    }, 30000).unref(); // .unref() prevents this timer from keeping the event loop alive
  }

  // ── Step 6: Process-Level Error Handlers ─────────────────────────────

  /**
   * Unhandled Promise Rejections.
   * Fires when a Promise is rejected and no .catch() handler is attached.
   * In Node.js ≥ 15, unhandled rejections crash the process by default.
   * We capture them here, log them, and shut down gracefully.
   *
   * NOTE: This should rarely fire if asyncHandler is used consistently.
   *       Treat each occurrence as a bug to fix.
   */
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('🚨  UNHANDLED PROMISE REJECTION:', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: String(promise),
    });
    gracefulShutdown('Unhandled Promise Rejection', 1);
  });

  /**
   * Uncaught Exceptions.
   * Fires when a synchronous error is thrown outside of a try/catch.
   * The process is in an undefined state after this — always exit and restart.
   *
   * NOTE: This should be impossible in well-written code.
   *       Treat every occurrence as a critical bug to fix immediately.
   */
  process.on('uncaughtException', (error) => {
    logger.error('🚨  UNCAUGHT EXCEPTION:', {
      message: error.message,
      stack: error.stack,
    });
    gracefulShutdown('Uncaught Exception', 1);
  });

  /**
   * SIGTERM — Sent by process managers (PM2, Docker, Kubernetes) to request
   * a clean shutdown. The process should stop accepting requests and drain
   * existing connections before exiting.
   */
  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM signal received', 0);
  });

  /**
   * SIGINT — Sent by Ctrl+C in the terminal (development).
   * Triggers the same graceful shutdown as SIGTERM.
   */
  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT (Ctrl+C)', 0);
  });
})();
