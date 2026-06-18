/**
 * config/env.js
 *
 * PURPOSE:
 *   Validates every required environment variable at process startup.
 *   If any required variable is missing, the server throws immediately
 *   with a clear, actionable error message — preventing cryptic runtime
 *   failures deep inside request handlers.
 *
 * USAGE:
 *   require('./config/env');        // Call once at the very top of server.js
 *   const { PORT } = process.env;  // Then read from process.env normally
 *
 * DESIGN:
 *   - Reads from process.env (dotenv must be called before this module)
 *   - Groups variables by domain for readable error output
 *   - Applies sensible defaults for non-critical optional vars
 *   - Exports a frozen config object as a convenience alternative to process.env
 */

'use strict';

const requiredVars = [
  // Server
  'NODE_ENV',
  'PORT',
  'CLIENT_URL',

  // Database
  'MONGO_URI',

  // JWT
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',

  // Email
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM_ADDRESS',

  // Google OAuth
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
];

/**
 * Validates that all required environment variables are present.
 * Throws a descriptive Error listing all missing variables at once
 * so developers don't have to fix them one by one.
 */
function validateEnv() {
  const missing = requiredVars.filter((key) => {
    const val = process.env[key];
    return val === undefined || val === null || val.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `\n\n🚫  Missing required environment variables:\n\n` +
        missing.map((key) => `   ❌  ${key}`).join('\n') +
        `\n\n📋  Copy .env.example → .env and fill in the missing values.\n`
    );
  }

  // Validate JWT secrets meet minimum length (64 chars for HS256 security)
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
  }
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long.');
  }

  // Warn (don't throw) if running production with a development-looking secret
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_ACCESS_SECRET.toLowerCase().includes('secret')
  ) {
    console.warn(
      '⚠️  WARNING: JWT_ACCESS_SECRET looks like a placeholder. Use a strong random value in production.'
    );
  }
}

/**
 * Applies sensible defaults for optional variables that have a known safe value.
 * Called after validation so we know all required vars are present.
 */
function applyDefaults() {
  process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '12';
  process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || '900000';
  process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '100';
  process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || '10';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  process.env.LOG_DIR = process.env.LOG_DIR || 'logs';
  process.env.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ShopEZ';
  process.env.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
}

// ── Run validation immediately when this module is required ──
validateEnv();
applyDefaults();

/**
 * Frozen config object.
 * Optional convenience: import { config } from './config/env' instead
 * of reaching into process.env throughout the codebase.
 * Numbers are parsed here so callers don't have to call parseInt().
 */
const config = Object.freeze({
  // Server
  NODE_ENV: process.env.NODE_ENV,
  PORT: parseInt(process.env.PORT, 10),
  CLIENT_URL: process.env.CLIENT_URL,
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV === 'development',

  // Database
  MONGO_URI: process.env.MONGO_URI,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  // Cloudinary (optional at startup — checked when upload routes are hit)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10),

  // Cookie
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_DIR: process.env.LOG_DIR,
});

module.exports = config;
