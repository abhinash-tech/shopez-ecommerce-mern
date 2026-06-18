/**
 * utils/AppError.js
 *
 * PURPOSE:
 *   Custom error class for all operational (expected) errors thrown
 *   by controllers and services. Extends the native Error class to carry
 *   an HTTP status code, a machine-readable error code, and an optional
 *   field-level errors array alongside the standard message.
 *
 * USAGE:
 *   throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
 *   throw new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors);
 *
 * DESIGN:
 *   The `isOperational` flag is key to the error-handling strategy.
 *
 *   - `isOperational: true`  → AppError (expected, handled, safe to surface)
 *     The global error handler sends these to the client with their status
 *     code and message. Examples: "Email already exists", "Product not found",
 *     "Insufficient stock".
 *
 *   - `isOperational: false` → Unknown errors (bugs, programmer mistakes)
 *     The global error handler returns a generic 500 and logs the full error.
 *     The client never sees the internal error detail. Examples: a TypeError,
 *     a database driver crash, an unexpected null reference.
 *
 * FIELD ERRORS:
 *   The optional `errors` array carries field-level validation errors
 *   in the format: [{ field: 'email', message: 'Invalid email format' }].
 *   This mirrors the shape expected by the frontend form validation logic.
 */

'use strict';

class AppError extends Error {
  /**
   * @param {string}   message     - Human-readable error message (sent to client).
   * @param {number}   statusCode  - HTTP status code (e.g. 400, 401, 403, 404, 422, 500).
   * @param {string}   [code]      - Machine-readable error code (e.g. 'PRODUCT_NOT_FOUND').
   *                                 Used by the frontend to show specific UI feedback.
   * @param {Array}    [errors]    - Field-level validation error objects [{ field, message }].
   */
  constructor(message, statusCode, code = 'INTERNAL_SERVER_ERROR', errors = []) {
    // Call the parent Error constructor to set `this.message` and capture
    // a proper V8 stack trace.
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.errors = errors; // Field-level validation errors (empty for most cases)
    this.isOperational = true; // Mark as expected/handled error

    // Capture a clean stack trace excluding the AppError constructor frame itself.
    // Without this, the stack trace would start at `new AppError(...)` which is
    // unhelpful — we want it to start at the caller (the controller/service).
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
