/**
 * middlewares/notFound.js
 *
 * PURPOSE:
 *   Catches all requests that don't match any defined route and converts
 *   them into a consistent 404 AppError. Without this middleware, Express
 *   would return an empty response (or its default HTML "Cannot GET /path"
 *   page) for unknown routes, which is inconsistent with the JSON API contract.
 *
 * PLACEMENT:
 *   Mount this middleware AFTER all route definitions but BEFORE the
 *   global errorHandler in app.js:
 *
 *     app.use('/api/v1', apiRouter);
 *     app.use(notFound);          // ← catches anything that fell through
 *     app.use(errorHandler);      // ← formats all errors including 404s
 *
 * BEHAVIOUR:
 *   Creates an AppError with status 404 and passes it to next(),
 *   which Express forwards to errorHandler for consistent JSON formatting.
 *
 *   Example response:
 *   {
 *     "success": false,
 *     "message": "Route GET /api/v1/products/xyz/does-not-exist was not found on this server.",
 *     "code": "ROUTE_NOT_FOUND"
 *   }
 */

'use strict';

const AppError = require('../utils/AppError');

/**
 * @param {Request}  req  - Express request object
 * @param {Response} res  - Express response (unused — passed to errorHandler)
 * @param {Function} next - Express next function
 */
function notFound(req, res, next) {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} was not found on this server.`,
      404,
      'ROUTE_NOT_FOUND'
    )
  );
}

module.exports = notFound;
