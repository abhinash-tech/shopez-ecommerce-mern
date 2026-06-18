/**
 * middlewares/authorize.js
 *
 * PURPOSE:
 *   Role-Based Access Control (RBAC) middleware.
 *   Checks if the currently authenticated user's role exists within the
 *   allowed roles array for a specific endpoint.
 */

'use strict';

const AppError = require('../utils/AppError');

/**
 * @param {...string} roles - Array of roles allowed to access the route
 * @returns {function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist if this runs after authenticate middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`,
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
};

module.exports = authorize;
