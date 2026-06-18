/**
 * routes/product.routes.js
 *
 * PURPOSE:
 *   Express router mapping Product endpoints to their respective controllers.
 *   Mixes public read access with private vendor/admin write access.
 */

'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/authenticate');
const { searchLimiter } = require('../middlewares/rateLimiter');

// ── Public Routes ─────────────────────────────────────────────────────────────

// Apply search limiter to the listing endpoint to prevent DB scraping/DoS
router.get('/', searchLimiter, productController.getProducts);

// Must be below '/' but can't conflict with specific static paths if any existed
router.get('/:slug', productController.getProductBySlug);


// ── Protected Routes (Vendor & Admin) ─────────────────────────────────────────

// All routes below this middleware require a valid JWT
router.use(authenticate);

// Note: authorize middleware (role checking) will be added in future phases.
// For now, authenticate ensures they are logged in, and the controller 
// enforces ownership checks.

router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
