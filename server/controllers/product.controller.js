/**
 * controllers/product.controller.js
 *
 * PURPOSE:
 *   Handles Product HTTP requests: Listing, Details, Search, and Vendor CRUD.
 */

'use strict';

const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const ProductService = require('../services/product.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ── Public Access Routes ──────────────────────────────────────────────────────

/**
 * @desc    Get all public products (with search, filter, sort, pagination)
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filters from query params
  const query = await ProductService.buildQuery(req.query);
  
  // Build sort config
  let sort = ProductService.buildSort(req.query.sort);

  // If text search is active and no specific sort is requested, sort by text relevance
  if (req.query.q && !req.query.sort) {
    sort = { score: { $meta: 'textScore' } };
  }

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-__v')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // faster execution since we don't need mongoose documents
    Product.countDocuments(query),
  ]);

  // Expose total count in headers for pagination
  res.set('X-Total-Count', total);

  res.status(200).json({
    success: true,
    data: products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get a single product by slug
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: 'active',
    isApproved: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// ── Vendor / Admin Access Routes (CRUD) ──────────────────────────────────────

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private (Vendor/Admin)
 */
const createProduct = asyncHandler(async (req, res) => {
  // Ensure the vendor ID is attached from the authenticated user
  const productData = {
    ...req.body,
    vendor: req.user._id, 
    // Force default status on creation
    status: 'draft',
    isApproved: false,
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

/**
 * @desc    Update an existing product
 * @route   PATCH /api/v1/products/:id
 * @access  Private (Vendor/Admin)
 */
const updateProduct = asyncHandler(async (req, res) => {
  // Find product and ensure ownership
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Ownership check (Only the vendor who created it or an admin can update)
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized to update this product', 403, 'FORBIDDEN');
  }

  // Prevent vendors from overriding approval status
  if (req.user.role === 'vendor') {
    delete req.body.isApproved;
    delete req.body.isFeatured;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

/**
 * @desc    Delete a product (Soft delete or archive)
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Vendor/Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Ownership check
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized to delete this product', 403, 'FORBIDDEN');
  }

  // Soft delete — update status to archived instead of permanently deleting
  product.status = 'archived';
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product archived successfully',
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
