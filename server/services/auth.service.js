/**
 * services/auth.service.js
 *
 * PURPOSE:
 *   Contains core authentication business logic separated from the HTTP layer.
 *   Handles token generation (JWTs), token verification, and payload structuring.
 *   This makes testing easier and keeps controllers thin.
 */

'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/env');

class AuthService {
  /**
   * Generates a short-lived Access Token.
   * Stored in memory on the client (or short-lived state) and sent as a Bearer token.
   *
   * @param {string} userId
   * @param {string} role
   * @returns {string} JWT access token
   */
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
  }

  /**
   * Generates a long-lived Refresh Token.
   * Stored securely in an httpOnly cookie.
   *
   * @param {string} userId
   * @returns {string} JWT refresh token
   */
  static generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Verifies an Access Token.
   *
   * @param {string} token
   * @returns {object} Decoded token payload
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  }

  /**
   * Verifies a Refresh Token.
   *
   * @param {string} token
   * @returns {object} Decoded token payload
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  }

  /**
   * Builds the cookie configuration object for the refresh token.
   *
   * @returns {object} Express cookie options
   */
  static getRefreshTokenCookieOptions() {
    const days = parseInt(config.JWT_REFRESH_EXPIRES_IN, 10);
    const maxAgeMs = days * 24 * 60 * 60 * 1000;

    return {
      httpOnly: true,              // JS cannot access this cookie (prevents XSS)
      secure: config.IS_PROD,      // Only sent over HTTPS in production
      sameSite: config.IS_PROD ? 'none' : 'lax', // Cross-origin handling
      maxAge: maxAgeMs,
      // domain: config.COOKIE_DOMAIN, // Uncomment if using subdomains
    };
  }
}

module.exports = AuthService;
