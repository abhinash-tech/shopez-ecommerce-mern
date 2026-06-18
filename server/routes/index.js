/**
 * routes/index.js
 *
 * PURPOSE:
 *   Master API router — the single mounting point for all route modules.
 *   This file is imported once in app.js and mounted at '/api/v1'.
 *
 * DESIGN:
 *   Each feature module has its own route file. This index simply imports
 *   and mounts them under their respective path prefixes.
 *   Adding a new feature only requires two lines here: import + mount.
 *
 *   Route modules are intentionally NOT imported yet (they will be
 *   created in subsequent development phases). Placeholder comments
 *   show where each module will plug in.
 *
 * HEALTH CHECK:
 *   A /api/v1/health endpoint is defined here directly (not in a separate
 *   file) because it is simple, stateless, and used by load balancers.
 *   It returns a 200 with server uptime and environment info.
 *
 * VERSIONING:
 *   All routes live under /api/v1/. When breaking changes require a new
 *   version, a /api/v2/ router will be created and mounted in app.js
 *   alongside this one. Old routes remain live during a deprecation window.
 */

'use strict';

const express = require('express');
const router = express.Router();
const os = require('os');

// ── Health Check ─────────────────────────────────────────────────────────────
/**
 * GET /api/v1/health
 *
 * Returns server health status for load balancer probes and monitoring tools.
 * This endpoint is intentionally unauthenticated and not rate-limited.
 *
 * Response: 200 OK
 * {
 *   "success": true,
 *   "status": "healthy",
 *   "timestamp": "2026-06-17T22:30:00.000Z",
 *   "environment": "development",
 *   "uptime": 3600.12,
 *   "version": "1.0.0"
 * }
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.round(process.uptime()),       // Seconds the server has been running
    memoryUsage: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
    },
    version: require('../package.json').version,
    hostname: os.hostname(),
  });
});

// ── Feature Routes ────────────────────────────────────────────────────────────
// Uncomment each line as its corresponding route file is implemented.

// Phase 1 — Auth
const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

// Phase 2 — Products & Categories
const productRoutes = require('./product.routes');
// const categoryRoutes = require('./category.routes');
router.use('/products', productRoutes);
// router.use('/categories', categoryRoutes);

// Phase 3 — Cart & Wishlist
const cartRoutes = require('./cart.routes');
// const wishlistRoutes = require('./wishlist.routes');
router.use('/cart', cartRoutes);
// router.use('/wishlist', wishlistRoutes);

// Phase 4 — Coupons
// const couponRoutes = require('./coupon.routes');
// router.use('/coupons', couponRoutes);

// Phase 5 — Orders & Payments
const orderRoutes = require('./order.routes');
// const paymentRoutes = require('./payment.routes');
router.use('/orders', orderRoutes);
// router.use('/payments', paymentRoutes);

// Phase 6 — Reviews
// const reviewRoutes = require('./review.routes');
// router.use('/reviews', reviewRoutes);

// Phase 7 — User Profile, Addresses, Notifications
const userRoutes = require('./user.routes');
// const notificationRoutes = require('./notification.routes');
router.use('/users', userRoutes);
// router.use('/notifications', notificationRoutes);

// Phase 8 — Vendor
// const vendorRoutes = require('./vendor.routes');
// router.use('/vendor', vendorRoutes);

// Phase 9 — Stores (public vendor storefronts)
// const storeRoutes = require('./store.routes');
// router.use('/stores', storeRoutes);

// Phase 10 — Admin
const adminRoutes = require('./admin.routes');
router.use('/admin', adminRoutes);

module.exports = router;
