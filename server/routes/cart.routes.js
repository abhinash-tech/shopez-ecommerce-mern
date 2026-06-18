/**
 * routes/cart.routes.js
 *
 * PURPOSE:
 *   Express router mapping Cart endpoints to their respective controllers.
 *   All cart endpoints require an authenticated user.
 */

'use strict';

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middlewares/authenticate');

// All cart operations require the user to be logged in
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
