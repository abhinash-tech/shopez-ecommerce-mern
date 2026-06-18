/**
 * models/Cart.model.js
 *
 * PURPOSE:
 *   Mongoose schema definition for the Cart collection.
 *   Each user has exactly one active cart document.
 *   The cart embeds its line items and takes snapshots of product
 *   data (price, name, image) at the time of addition.
 */

'use strict';

const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId, // Maps to Product.variants[]._id
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  // ── Snapshots ───────────────────────────────────────────────────────────
  // We snapshot data at the time of addition so the cart renders quickly
  // without needing deep populated queries every time, and to freeze the price.
  priceSnapshot: {
    type: Number,
    required: true,
    min: 0,
  },
  nameSnapshot: {
    type: String,
    required: true,
  },
  imageSnapshot: {
    type: String,
    required: true,
  },
  variantNameSnapshot: {
    type: String,
    default: null,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: {
      type: [CartItemSchema],
      validate: [
        (val) => val.length <= 20,
        'Cart cannot hold more than 20 distinct items',
      ],
      default: [],
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
CartSchema.index({ updatedAt: 1 }); // For cron jobs to clear old abandoned carts
CartSchema.index({ 'items.product': 1 }); // To find carts containing specific products

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
