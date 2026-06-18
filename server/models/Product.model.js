/**
 * models/Product.model.js
 *
 * PURPOSE:
 *   Mongoose schema definition for the Product collection.
 *   Enforces data integrity, validation rules, embedded variants,
 *   and indexing for search and category filtering.
 */

'use strict';

const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attributes: { type: Map, of: String, required: true },
  price: { type: Number, required: true, min: [1, 'Price must be greater than 0'] },
  salePrice: { type: Number, default: null },
  sku: { type: String, required: true },
  stockQuantity: { type: Number, required: true, min: [0, 'Stock cannot be negative'] },
  images: [{ type: String }],
});

const DimensionsSchema = new mongoose.Schema({
  length: { type: Number },
  width: { type: Number },
  height: { type: Number },
}, { _id: false });

const MetaSchema = new mongoose.Schema({
  title: { type: String, maxlength: 60 },
  description: { type: String, maxlength: 160 },
  keywords: [{ type: String }],
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Technically references the Vendor, but mapping to User for MVP
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: {
      type: [String],
      validate: [
        (val) => val.length <= 10,
        'Maximum 10 tags allowed'
      ],
    },
    brand: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      required: [true, 'At least 1 image is required'],
      validate: [
        (val) => val.length > 0 && val.length <= 8,
        'Please upload between 1 and 8 images',
      ],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [1, 'Price must be greater than 0'],
      max: [99999999, 'Price exceeds maximum allowed value'], // stored in paise
    },
    salePrice: {
      type: Number,
      default: null,
    },
    saleStartDate: { type: Date, default: null },
    saleEndDate: { type: Date, default: null },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      maxlength: 50,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Invalid stock quantity'],
      max: 99999,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'active', 'out_of_stock', 'archived', 'rejected'],
      default: 'draft',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    variants: [ProductVariantSchema],
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      min: 1,
      default: null,
    },
    dimensions: DimensionsSchema,
    meta: MetaSchema,
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ status: 1, isApproved: 1 });
ProductSchema.index({ avgRating: -1, status: 1 });
ProductSchema.index({ basePrice: 1, status: 1 });
// Full-text search index for search functionality
ProductSchema.index(
  { name: 'text', description: 'text', tags: 'text', brand: 'text' },
  { weights: { name: 10, brand: 5, tags: 3, description: 1 } }
);

// ── Pre-Save Hook (Slug Generation) ───────────────────────────────────────────
ProductSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  
  if (!this.slug) {
    // Basic slug generation — append random string to avoid collisions
    const baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  
  // Validation: salePrice must be less than basePrice
  if (this.salePrice && this.salePrice >= this.basePrice) {
    return next(new Error('Sale price must be less than the original price'));
  }
  
  next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
