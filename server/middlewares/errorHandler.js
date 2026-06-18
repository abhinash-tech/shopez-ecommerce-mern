/**
 * middlewares/errorHandler.js
 *
 * PURPOSE:
 *   Global error-handling middleware — the last line of defence in the
 *   Express middleware chain. Catches every error passed via next(err),
 *   normalises it into a consistent JSON response, and ensures internal
 *   details are never leaked to the client in production.
 *
 * HOW EXPRESS ERROR HANDLERS WORK:
 *   A middleware with exactly 4 parameters (err, req, res, next) is
 *   treated by Express as an error handler. It must be mounted AFTER all
 *   regular routes and middlewares in app.js.
 *
 * ERROR CATEGORIES HANDLED:
 *   1. AppError (isOperational: true)
 *      → Our own thrown errors: 404s, 401s, 400s, 422s, etc.
 *      → Send status + message + code directly to the client.
 *
 *   2. Mongoose Validation Error (ValidationError)
 *      → Schema validation failed (e.g., required field missing).
 *      → Convert to 422 VALIDATION_ERROR with field-level detail.
 *
 *   3. Mongoose Duplicate Key Error (code 11000)
 *      → Unique index violation (e.g., email already registered).
 *      → Convert to 409 DUPLICATE_KEY with a human-readable message.
 *
 *   4. Mongoose Cast Error (CastError)
 *      → Invalid MongoDB ObjectId in URL param (e.g., /products/not-an-id).
 *      → Convert to 400 INVALID_ID.
 *
 *   5. JWT Errors
 *      → JsonWebTokenError: tampered/malformed token → 401 UNAUTHORIZED
 *      → TokenExpiredError: expired token → 401 TOKEN_EXPIRED
 *
 *   6. Multer File Upload Errors
 *      → File too large, wrong type → 400 UPLOAD_ERROR
 *
 *   7. Unknown / Programming Errors
 *      → Anything not caught above (TypeError, ReferenceError, etc.)
 *      → Log the full error internally; send generic 500 to the client.
 *
 * RESPONSE FORMAT:
 *   All errors conform to the standard ShopEZ error envelope:
 *   {
 *     "success": false,
 *     "message": "Human-readable description",
 *     "code": "MACHINE_READABLE_CODE",
 *     "errors": [{ "field": "email", "message": "..." }]  // 422 only
 *   }
 */

'use strict';

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ── Normaliser Functions ─────────────────────────────────────────────────────

/**
 * Handles Mongoose schema validation errors.
 * Converts the nested Mongoose error structure into our flat field-errors array.
 */
function handleMongooseValidationError(err) {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError('Validation failed. Please check the submitted data.', 422, 'VALIDATION_ERROR', errors);
}

/**
 * Handles MongoDB duplicate key errors (E11000).
 * Extracts the duplicated field name from the error message.
 */
function handleMongoDuplicateKeyError(err) {
  // err.keyValue = { email: 'user@example.com' }
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue?.[field];
  return new AppError(
    `The value '${value}' is already taken for ${field}. Please use a different value.`,
    409,
    'DUPLICATE_KEY'
  );
}

/**
 * Handles Mongoose CastError — usually an invalid ObjectId in a URL param.
 * Example: GET /products/not-a-valid-id
 */
function handleMongooseCastError(err) {
  return new AppError(
    `Invalid value '${err.value}' for field '${err.path}'. Expected a valid ID.`,
    400,
    'INVALID_ID'
  );
}

/**
 * Handles JWT signature verification failures.
 * The token exists but its signature is wrong (tampered or wrong secret).
 */
function handleJWTError() {
  return new AppError(
    'Invalid token. Please log in again.',
    401,
    'UNAUTHORIZED'
  );
}

/**
 * Handles JWT expiry errors.
 * The token was valid but its `exp` claim is in the past.
 */
function handleJWTExpiredError() {
  return new AppError(
    'Your session has expired. Please log in again.',
    401,
    'TOKEN_EXPIRED'
  );
}

/**
 * Handles Multer file upload errors.
 * Covers file size limit exceeded and unsupported file types.
 */
function handleMulterError(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum allowed size is 5MB.', 400, 'UPLOAD_ERROR');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Check your form field names.', 400, 'UPLOAD_ERROR');
  }
  return new AppError(err.message || 'File upload failed.', 400, 'UPLOAD_ERROR');
}

// ── Development Error Response ────────────────────────────────────────────────

/**
 * Development: sends the full error including stack trace.
 * Never use in production — stack traces leak implementation details.
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
}

// ── Production Error Response ─────────────────────────────────────────────────

/**
 * Production: only sends sanitised information to the client.
 * Unknown errors get a generic 500 message; their details are logged.
 */
function sendErrorProd(err, res) {
  if (err.isOperational) {
    // Trusted, expected error — safe to send details to the client
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // Unknown / programming error — log full details, send generic message
  logger.error('🐛  UNHANDLED ERROR (non-operational):', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
  });

  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

// ── Global Error Handler Middleware ───────────────────────────────────────────

/**
 * @param {Error}    err  - The error object (native or AppError)
 * @param {Request}  req  - Express request object
 * @param {Response} res  - Express response object
 * @param {Function} next - Express next function (unused but MUST be declared
 *                          for Express to recognise this as an error handler)
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Set fallback status and message if not already set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.errors = err.errors || [];

  const isDev = process.env.NODE_ENV === 'development';

  // Log all errors (the level varies: operational = warn, unknown = error)
  if (err.isOperational) {
    logger.warn(`⚠️  [${err.statusCode}] ${err.code}: ${err.message}`, {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.error(`❌  UNHANDLED: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // ── Normalise known error types to AppError before responding ──
  let handledErr = err;

  if (!isDev) {
    // Mongoose Validation
    if (err.name === 'ValidationError') {
      handledErr = handleMongooseValidationError(err);
    }
    // MongoDB Duplicate Key
    else if (err.code === 11000) {
      handledErr = handleMongoDuplicateKeyError(err);
    }
    // Mongoose CastError (bad ObjectId)
    else if (err.name === 'CastError') {
      handledErr = handleMongooseCastError(err);
    }
    // JWT signature invalid
    else if (err.name === 'JsonWebTokenError') {
      handledErr = handleJWTError();
    }
    // JWT expired
    else if (err.name === 'TokenExpiredError') {
      handledErr = handleJWTExpiredError();
    }
    // Multer file upload errors
    else if (err.name === 'MulterError') {
      handledErr = handleMulterError(err);
    }
  } else {
    // In development, still normalise but include full stack in response
    if (err.name === 'ValidationError') handledErr = handleMongooseValidationError(err);
    if (err.code === 11000) handledErr = handleMongoDuplicateKeyError(err);
    if (err.name === 'CastError') handledErr = handleMongooseCastError(err);
    if (err.name === 'JsonWebTokenError') handledErr = handleJWTError();
    if (err.name === 'TokenExpiredError') handledErr = handleJWTExpiredError();
    if (err.name === 'MulterError') handledErr = handleMulterError(err);
  }

  // Send the appropriate response format
  if (isDev) {
    sendErrorDev(handledErr, res);
  } else {
    sendErrorProd(handledErr, res);
  }
}

module.exports = errorHandler;
