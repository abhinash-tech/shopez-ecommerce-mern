/**
 * utils/asyncHandler.js
 *
 * PURPOSE:
 *   A higher-order function (HOF) that wraps async Express route handlers.
 *   Catches any rejected Promise and passes the error to Express's next()
 *   function so it reaches the global errorHandler middleware.
 *
 * THE PROBLEM IT SOLVES:
 *   Async route handlers that throw (or return rejected Promises) do NOT
 *   automatically reach Express's error handler. Without this wrapper,
 *   every async controller would need its own try/catch:
 *
 *   // Without asyncHandler — repetitive, easy to forget:
 *   router.get('/products', async (req, res, next) => {
 *     try {
 *       const products = await Product.find();
 *       res.json(products);
 *     } catch (err) {
 *       next(err);  // manually forwarded
 *     }
 *   });
 *
 * THE SOLUTION:
 *   // With asyncHandler — clean, DRY, no boilerplate:
 *   router.get('/products', asyncHandler(async (req, res) => {
 *     const products = await Product.find();
 *     res.json(products);  // throws auto-forwarded to errorHandler
 *   }));
 *
 * HOW IT WORKS:
 *   asyncHandler(fn) returns a new Express-compatible middleware function.
 *   When Express calls the returned function, it invokes `fn` and wraps
 *   the returned Promise in `.catch(next)`. Any rejection (thrown AppError,
 *   Mongoose error, network error, etc.) is passed directly to next().
 *
 * @param {Function} fn - An async Express route handler (req, res, next) => Promise
 * @returns {Function}    A synchronous wrapper that Express can safely call
 */

'use strict';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
