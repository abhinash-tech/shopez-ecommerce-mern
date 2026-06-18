/**
 * controllers/admin.controller.js
 *
 * PURPOSE:
 *   Handles all system-wide administrative functions.
 *   Provides macro-level visibility into Users, Products, and Orders,
 *   bypassing the strict scoping rules of the customer endpoints.
 */

'use strict';

const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ── Dashboard Statistics ──────────────────────────────────────────────────────

/**
 * @desc    Get macro-level business statistics
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin/Super Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Execute independent aggregation queries concurrently
  const [totalUsers, totalProducts, totalOrders, revenueStats] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      // Only sum totals for orders that are not cancelled or returned
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ])
  ]);

  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    }
  });
});

// ── Manage Users ─────────────────────────────────────────────────────────────

/**
 * @desc    Get all users globally with pagination
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin/Super Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select('-password -refreshToken') // Never leak credentials
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments()
  ]);

  res.set('X-Total-Count', total);

  res.status(200).json({
    success: true,
    data: users,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

/**
 * @desc    Update user status (Ban, deactivate, change role)
 * @route   PATCH /api/v1/admin/users/:id
 * @access  Private (Super Admin only for roles, Admin for bans)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isBanned, banReason, isActive, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Only super_admin can change roles
  if (role && req.user.role !== 'super_admin') {
    throw new AppError('Only Super Admins can alter user roles', 403, 'FORBIDDEN');
  } else if (role) {
    user.role = role;
  }

  // Handle bans
  if (isBanned !== undefined) {
    user.isBanned = isBanned;
    user.banReason = isBanned ? banReason : null;
  }
  
  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  // validateBeforeSave: false is used so we don't accidentally trigger validation 
  // on old schemas if the user document is very old
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    data: user
  });
});

// ── Manage Products ──────────────────────────────────────────────────────────

/**
 * @desc    Get all products across all vendors
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin/Super Admin)
 */
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Allows filtering specifically for unapproved/pending items
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);

  res.set('X-Total-Count', total);

  res.status(200).json({
    success: true,
    data: products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

/**
 * @desc    Approve/Reject a vendor's product listing
 * @route   PATCH /api/v1/admin/products/:id/approval
 * @access  Private (Admin/Super Admin)
 */
const updateProductApproval = asyncHandler(async (req, res) => {
  const { isApproved, status, isFeatured } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  if (isApproved !== undefined) product.isApproved = isApproved;
  if (status) product.status = status;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product approval status updated',
    data: product
  });
});

// ── Manage Orders ────────────────────────────────────────────────────────────

/**
 * @desc    Get all orders across the entire platform
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin/Super Admin)
 */
const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter)
  ]);

  res.set('X-Total-Count', total);

  res.status(200).json({
    success: true,
    data: orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllProductsAdmin,
  updateProductApproval,
  getAllOrdersAdmin
};
