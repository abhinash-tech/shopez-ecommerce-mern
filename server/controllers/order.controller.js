/**
 * controllers/order.controller.js
 *
 * PURPOSE:
 *   Handles HTTP requests for Order placement and retrieval.
 *   Provides customer endpoints for order history and vendor/admin
 *   endpoints for status updates.
 */

'use strict';

const Order = require('../models/Order.model');
const CartService = require('../services/cart.service');
const OrderService = require('../services/order.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Place a new order (Checkout)
 * @route   POST /api/v1/orders
 * @access  Private (Customer)
 */
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw new AppError('Shipping address and payment method are required', 400, 'MISSING_DATA');
  }

  // 1. Get the user's active cart
  const cart = await CartService.getOrCreateCart(req.user._id);

  // 2. Process checkout via service layer
  const order = await OrderService.processCheckout(req.user, cart, shippingAddress, paymentMethod);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/v1/orders
 * @access  Private (Customer)
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .select('orderNumber totalAmount status createdAt items.image items.name items.quantity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id })
  ]);

  res.set('X-Total-Count', total);

  res.status(200).json({
    success: true,
    data: orders,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private (Customer)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Enforce ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized to view this order', 403, 'FORBIDDEN');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private (Admin/Vendor)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;

  // Basic role check (will be replaced by robust authorize middleware later)
  if (req.user.role === 'customer' || req.user.role === 'guest') {
    throw new AppError('Not authorized to update order status', 403, 'FORBIDDEN');
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400, 'INVALID_STATUS');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Update status and append to history
  order.status = status;
  order.statusHistory.push({
    status,
    comment: comment || `Status updated to ${status} by ${req.user.role}`,
    timestamp: Date.now(),
  });

  // Also update line item statuses for simplicity in MVP
  order.items.forEach(item => {
    item.status = status;
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
