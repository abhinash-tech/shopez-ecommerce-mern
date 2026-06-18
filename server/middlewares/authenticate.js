/**
 * middlewares/authenticate.js
 *
 * PURPOSE:
 *   Protects routes by requiring a valid JWT Access Token.
 *   Reads the token from the `Authorization: Bearer <token>` header,
 *   verifies its signature, checks its expiry, and retrieves the associated
 *   user from the database.
 *
 *   If valid, attaches the user document to `req.user` and calls `next()`.
 *   If invalid, missing, or the user is banned/deleted, throws an AppError.
 */

'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>" string
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(
      'You are not logged in. Please provide an access token.',
      401,
      'UNAUTHORIZED'
    );
  }

  // 2. Verify token signature and expiry
  // jsonwebtoken's verify throws JsonWebTokenError or TokenExpiredError on failure,
  // which our global errorHandler already catches and formats automatically.
  const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError(
      'The user belonging to this token no longer exists.',
      401,
      'USER_NOT_FOUND'
    );
  }

  // 4. Check if user is active and not banned
  if (!currentUser.isActive) {
    throw new AppError('Your account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED');
  }
  if (currentUser.isBanned) {
    throw new AppError('Your account has been banned.', 403, 'ACCOUNT_BANNED');
  }

  // 5. Grant access to protected route
  req.user = currentUser;
  next();
});

module.exports = authenticate;
