/**
 * config/db.js
 *
 * PURPOSE:
 *   Establishes and manages the MongoDB connection using Mongoose.
 *   Handles initial connection, reconnection on drop, and clean
 *   shutdown on process termination signals.
 *
 * EXPORTS:
 *   connectDB()  — async function; call once in server.js before
 *                  starting the HTTP listener.
 *
 * DESIGN DECISIONS:
 *   - Connection options use { serverSelectionTimeoutMS: 5000 } so the
 *     process fails fast if the Atlas cluster is unreachable at startup,
 *     rather than hanging indefinitely.
 *   - Event listeners (connected, error, disconnected) provide runtime
 *     observability through the Winston logger.
 *   - SIGINT / SIGTERM handlers close the Mongoose connection gracefully
 *     before the process exits — important for replica sets to avoid
 *     unnecessary primary elections.
 *   - Mongoose's built-in buffering keeps requests queued during brief
 *     disconnects; manual reconnect logic is NOT needed (Mongoose does it).
 */

'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

/**
 * Mongoose global settings applied once before any connection attempt.
 * These affect all Mongoose operations across the entire application.
 */
mongoose.set('strictQuery', true); // Throw on unknown schema fields in queries
mongoose.set('debug', config.IS_DEV); // Log every Mongoose query in development only

/**
 * Connect to MongoDB Atlas (or local MongoDB in development).
 *
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws  {Error}         If the initial connection attempt fails.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      // Timeout settings
      serverSelectionTimeoutMS: 5000,   // Give up if can't reach server in 5s
      socketTimeoutMS: 45000,           // Close socket after 45s of inactivity

      // Connection pool
      maxPoolSize: 50,                  // Max concurrent connections from this server process
      minPoolSize: 5,                   // Always keep 5 connections open

      // Heartbeat (detect stale connections)
      heartbeatFrequencyMS: 10000,      // Check connection health every 10s

      // Atlas / replica set
      retryWrites: true,
      w: 'majority',                    // Write concern: majority of replica set must acknowledge
    });

    logger.info(`✅  MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    logger.error(`❌  MongoDB initial connection failed: ${error.message}`);
    // Exit the process so the container/process manager (PM2, Docker, systemd)
    // restarts it. Don't try to limp along with no database.
    process.exit(1);
  }
}

// ── Event Listeners ──────────────────────────────────────────────────────────

/**
 * 'connected' fires when Mongoose successfully opens a connection.
 * Also fires after reconnects, so this can appear multiple times per process.
 */
mongoose.connection.on('connected', () => {
  logger.info('🔗  Mongoose connection established.');
});

/**
 * 'error' fires when a Mongoose connection error occurs after the initial
 * connection. The connection will attempt to auto-reconnect.
 */
mongoose.connection.on('error', (err) => {
  logger.error(`⚠️  Mongoose connection error: ${err.message}`);
});

/**
 * 'disconnected' fires when the connection is lost.
 * Mongoose automatically attempts to reconnect; log the event for observability.
 */
mongoose.connection.on('disconnected', () => {
  logger.warn('🔌  Mongoose disconnected. Attempting to reconnect...');
});

/**
 * 'reconnected' fires after a successful reconnect attempt.
 */
mongoose.connection.on('reconnected', () => {
  logger.info('🔁  Mongoose reconnected successfully.');
});

// ── Graceful Shutdown Handlers ────────────────────────────────────────────────

/**
 * SIGINT  — Ctrl-C in the terminal (local development)
 * SIGTERM — Docker stop, Kubernetes pod termination, PM2 restart
 *
 * Both signals should close the Mongoose connection cleanly so in-flight
 * operations can complete and the MongoDB driver can deregister from
 * any replica set elections.
 */
async function gracefulShutdown(signal) {
  logger.info(`\n🛑  ${signal} received. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    logger.info('✅  MongoDB connection closed cleanly. Exiting process.');
    process.exit(0);
  } catch (err) {
    logger.error(`❌  Error during MongoDB shutdown: ${err.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
