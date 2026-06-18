/**
 * routes/admin.routes.js
 *
 * PURPOSE:
 *   Express router mapping Admin endpoints to their controllers.
 *   Strictly guarded by JWT authentication AND Role-Based Access Control.
 */

'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

// ── Global Admin Middleware ───────────────────────────────────────────────────
// All routes require valid JWT AND 'admin' or 'super_admin' role
router.use(authenticate, authorize('admin', 'super_admin'));

// Dashboard Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Manage Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUserStatus);

// Manage Products
router.get('/products', adminController.getAllProductsAdmin);
router.patch('/products/:id/approval', adminController.updateProductApproval);

// Manage Orders
router.get('/orders', adminController.getAllOrdersAdmin);
// Note: We can reuse the `updateOrderStatus` from the orderController here, 
// or let admins use the existing `PATCH /api/v1/orders/:id/status` endpoint.

module.exports = router;
