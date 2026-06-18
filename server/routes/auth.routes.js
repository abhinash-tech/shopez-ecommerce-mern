/**
 * routes/auth.routes.js
 *
 * PURPOSE:
 *   Express router mapping auth endpoints to their respective controllers.
 *   Applies the `authLimiter` middleware to protect against brute-force attacks.
 */

'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const authenticate = require('../middlewares/authenticate');

// Rate-limited auth routes
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);

// Protected — requires valid Bearer token
router.get('/me', authenticate, authController.getMe);

module.exports = router;
