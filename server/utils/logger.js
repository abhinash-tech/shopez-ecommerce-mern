/**
 * utils/logger.js
 *
 * PURPOSE:
 *   Centralised logging utility built on Winston.
 *   Provides structured, levelled logging across the entire backend.
 *   In development: pretty-prints colourised logs to the console.
 *   In production: writes structured JSON to rotating daily log files.
 *
 * EXPORTS:
 *   logger — a configured Winston Logger instance.
 *            Use logger.info(), logger.warn(), logger.error(), logger.debug()
 *            instead of console.log() throughout the codebase.
 *
 * LOG LEVELS (lowest → highest severity, higher = less verbose):
 *   error   (0) — Unhandled exceptions, critical failures
 *   warn    (1) — Deprecation warnings, CORS blocks, bad auth attempts
 *   info    (2) — Server start, DB connect, request lifecycle events
 *   http    (3) — Morgan HTTP access log integration
 *   debug   (4) — Mongoose queries, detailed service flow (dev only)
 *
 * LOG FILES (production):
 *   logs/error-YYYY-MM-DD.log  — error level only
 *   logs/combined-YYYY-MM-DD.log — all levels
 *   Retained for 30 days, max 20MB per file, gzip compressed.
 */

'use strict';

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure the logs directory exists before Winston tries to write to it
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ── Format Definitions ───────────────────────────────────────────────────────

/**
 * Development format: colourised, human-readable single-line output.
 * Example:
 *   2026-06-17 22:30:00 [info]: ✅  MongoDB Connected: cluster0.xxxxx.mongodb.net
 */
const devFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Production format: structured JSON for log aggregation tools
 * (Datadog, CloudWatch, Elastic Stack, etc.).
 * Example:
 *   {"timestamp":"2026-06-17T22:30:00.000Z","level":"info","message":"Connected","service":"shopez-api"}
 */
const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),  // Include stack trace on error objects
  format.json()
);

// ── Transports ───────────────────────────────────────────────────────────────

const isDev = (process.env.NODE_ENV || 'development') === 'development';

/**
 * Console transport — used in development only.
 * In production, logs go to files and are shipped to an aggregator.
 */
const consoleTransport = new transports.Console({
  format: isDev ? devFormat : prodFormat,
  silent: process.env.NODE_ENV === 'test', // Suppress logs during test runs
});

/**
 * Rotating file transport for ALL levels (info, warn, error, debug).
 * Written only in non-development environments.
 */
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',       // Roll over after 20MB
  maxFiles: '30d',      // Keep files for 30 days
  zippedArchive: true,  // Gzip old logs to save disk space
  format: prodFormat,
});

/**
 * Rotating file transport for ERROR level only.
 * Useful for quick-scanning critical failures without noise.
 */
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: prodFormat,
});

// ── Logger Instance ──────────────────────────────────────────────────────────

const logger = createLogger({
  /**
   * Log level threshold: messages below this level are silently dropped.
   * Read from LOG_LEVEL env var, defaulting to 'debug' in dev, 'info' in prod.
   */
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  /**
   * Default metadata added to every log entry.
   * Useful for identifying the service in multi-service log aggregators.
   */
  defaultMeta: { service: 'shopez-api' },

  /**
   * Exception and rejection handling:
   * Winston catches unhandled Promise rejections and uncaught exceptions
   * and logs them before the process exits (or is kept alive).
   */
  exceptionHandlers: [
    new transports.Console({ format: devFormat }),
    ...(!isDev ? [errorFileTransport] : []),
  ],
  rejectionHandlers: [
    new transports.Console({ format: devFormat }),
    ...(!isDev ? [errorFileTransport] : []),
  ],

  /**
   * exitOnError: false — don't crash the process when a logged error is thrown
   * by the logger itself (e.g., file write permission issues).
   */
  exitOnError: false,

  transports: [
    consoleTransport,
    ...(!isDev ? [combinedFileTransport, errorFileTransport] : []),
  ],
});

/**
 * Morgan stream integration.
 * Morgan's HTTP request logger can pipe its output to Winston by writing
 * to this stream. Configure in app.js:
 *   app.use(morgan('combined', { stream: logger.stream }));
 */
logger.stream = {
  write: (message) => {
    // Morgan appends a newline; trim it before handing to Winston
    logger.http(message.trim());
  },
};

module.exports = logger;
