/**
 * controllers/auth.controller.js
 *
 * PURPOSE:
 *   Handles authentication-related HTTP requests: registration and login.
 *   Extracts data from the request, calls the DB/service layer, and formats
 *   the HTTP response. Wrapped in `asyncHandler` to eliminate try/catch blocks.
 */

'use strict';

const User = require('../models/User.model');
const AuthService = require('../services/auth.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if email already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new AppError('Email is already registered', 409, 'DUPLICATE_EMAIL');
  }

  // 2. Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // 3. Generate tokens
  const accessToken = AuthService.generateAccessToken(user._id, user.role);
  const refreshToken = AuthService.generateRefreshToken(user._id);

  // 4. Hash refresh token and save to DB (for token invalidation/logout)
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  // 5. Send response with cookie
  const cookieOptions = AuthService.getRefreshTokenCookieOptions();
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400, 'MISSING_CREDENTIALS');
  }

  // 1. Find user (must explicitly select password since it's select: false in schema)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +failedLoginAttempts +lockUntil');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Check if account is locked
  if (user.isLocked()) {
    throw new AppError('Account is temporarily locked due to too many failed login attempts. Please try again later.', 403, 'ACCOUNT_LOCKED');
  }

  // 3. Check if active and not banned
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }
  if (user.isBanned) {
    throw new AppError(`Account is banned: ${user.banReason || 'Violations'}`, 403, 'ACCOUNT_BANNED');
  }

  // 4. Verify password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    // Increment failed login attempts
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
    }
    await user.save({ validateBeforeSave: false });
    
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // 5. Successful login — reset lockouts and update last login
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = Date.now();

  // 6. Generate tokens
  const accessToken = AuthService.generateAccessToken(user._id, user.role);
  const refreshToken = AuthService.generateRefreshToken(user._id);

  // 7. Save hashed refresh token to DB
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await user.save({ validateBeforeSave: false });

  // 8. Send response
  const cookieOptions = AuthService.getRefreshTokenCookieOptions();
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Strip password from response output manually (since we selected it explicitly)
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/v1/auth/me
 * @access  Private (requires Bearer token)
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by the authenticate middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
