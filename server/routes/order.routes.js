/**
 * routes/order.routes.js
 *
 * PURPOSE:
 *   Express router mapping Order endpoints to their respective controllers.
 *   All order endpoints require authentication.
 */

'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/authenticate');

// All order operations require the user to be logged in
router.use(authenticate);

// Customer Routes
router.post('/', orderController.placeOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin/Vendor Routes (Role enforcement handled in controller currently)
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
